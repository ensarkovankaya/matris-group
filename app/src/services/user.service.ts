import { PaginateOptions, PaginateResult } from 'mongoose';
import { Service } from 'typedi';
import { InvalidArgument, InvalidDocument, UserExists, UserNotFound } from '../errors';
import { getLogger, Logger } from "../logger";
import { IUserFilter } from '../models/user.filter.model';
import { IUser, IUserDocument } from '../models/user.model';
import { User } from '../schemas/user.schema';
import { DatabaseService } from "./database.service";
import { GroupService } from './group.service';

@Service('UserService')
export class UserService {

    /**
     * Transform User document to User object
     * @param {IUserDocument} doc Mongo User Document
     * @returns {IUser}
     */
    public static toUser(doc: IUserDocument): IUser {
        if (!(doc instanceof User)) {
            throw new InvalidDocument('Document must be instance of User');
        }
        return {
            id: doc.id,
            count: doc.count,
            groups: doc.groups,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            deletedAt: doc.deletedAt,
            deleted: doc.deleted
        };
    }

    private logger: Logger;

    constructor(private db: DatabaseService) {
        this.logger = getLogger('UserService', ['service']);
    }

    /**
     * Get User entry
     * @param {string} id  User id
     * @param {boolean} deleted Is user entry deleted
     * @returns {Promise<IUser | null>} List of groups
     */
    public async get(id: string, deleted: boolean = false): Promise<IUser | null> {
        this.logger.info('Getting user from database', { id, deleted });

        if (typeof id !== 'string' || id.length !== 24) {
            throw new InvalidArgument('id');
        }
        if (typeof deleted !== 'boolean') {
            throw new InvalidArgument('deleted');
        }

        try {
            const user = await this.db.findOneUserBy({ id, deleted });
            return user ? UserService.toUser(user) : null;
        } catch (e) {
            this.logger.error('Getting user failed', e, { id, deleted });
            throw e;
        }
    }

    /**
     * Creates new user entry
     * @param {string} id User id
     */
    public async create(id: string): Promise<IUser> {
        this.logger.debug('Create', { id });
        if (typeof id !== 'string' || id.length !== 24) {
            throw new InvalidArgument('id');
        }

        const user = await this.db.findOneUserBy({ id, deleted: false });

        if (user) {
            this.logger.warn('User already exists', { user });
            throw new UserExists(`User entry already exists with id "${id}".`);
        }

        try {
            return this.db.createUser(id, {}).then(doc => UserService.toUser(doc));
        } catch (e) {
            this.logger.error('Create', e);
            throw e;
        }
    }

    /**
     * Marks user entry as deleted
     * @param {string} id User id
     */
    public async delete(id: string): Promise<boolean> {
        this.logger.debug('Update', { id });
        if (typeof id !== 'string' || id.length !== 24) {
            throw new InvalidArgument('id');
        }

        const user = await this.db.findOneUserBy({ id, deleted: false });

        if (!user) {
            this.logger.warn('User not found.', { id });
            throw new UserNotFound(`User not found with id "${id}".`);
        }

        try {
            await this.db.updateUser(id, { deleted: true, deletedAt: new Date() });
            return true;
        } catch (e) {
            this.logger.error('Update', e);
            throw e;
        }
    }

    /**
     * List users from database
     * @param {IUserFilter} filters
     * @param {PaginateOptions} pagination Default {limit: 10}.
     * @returns {PaginateResult<IUser>}
     */
    public async list(filters: IUserFilter, pagination: PaginateOptions = { limit: 10 }):
        Promise<PaginateResult<IUser>> {
        this.logger.info('Listing users.', { filters, pagination });
        try {
            const result = await this.db.filterUser(filters, pagination);
            return {
                docs: result.docs.map(d => UserService.toUser(d)),
                total: result.total,
                limit: result.limit,
                page: result.page,
                pages: result.pages,
                offset: result.offset
            };
        } catch (e) {
            this.logger.error('Listing users failed', e, { filters, pagination });
            throw e;
        }
    }

    /**
     * Adds group realation to User entry. If user entry not exists creates one
     * @param userId User id
     * @param groupId Group id
     */
    public async add(userId: string, groupId: string): Promise<void> {
        try {
            const user = await this.db.findOneUserBy({ id: userId, deleted: false });

            if (user) {
                this.logger.debug('User entry exists', { user });
                const groups = new Set(user.groups);

                // If user already in group do not perform db update
                if (groups.has(groupId)) {
                    this.logger.warn('User already in group.', { userId, groupId });
                    return;
                }

                groups.add(groupId);
                await this.db.updateUser(userId, {
                    groups: [...groups],
                    count: groups.size
                });
            } else {
                this.logger.info('User entry not found, creating.');
                await this.db.createUser(userId, {
                    groups: [groupId],
                    count: 1
                });
            }
        } catch (e) {
            this.logger.error('Adding group to user entry failed', e, { userId, groupId });
            throw e;
        }
    }

    /**
     * Remove Group relation from User entry
     * @param {string} userId User id
     * @param {string} groupId Group id
     */
    public async remove(userId: string, groupId: string): Promise<void> {
        try {
            const user = await this.db.findOneUserBy({ id: userId, deleted: false });

            if (user) {
                const groups = new Set(user.groups);
                const removed = groups.delete(groupId);
                // If group not in user group's do not perform db update
                if (!removed) {
                    this.logger.warn('User already not in group', { userId, groupId });
                    return;
                }
                await this.db.updateUser(userId, { groups: [...groups], count: groups.size });
            } else {
                this.logger.warn('User entry not found.', { userId, groupId });
            }
        } catch (e) {
            this.logger.error('Removing group relation from user failed', e, { userId, groupId });
            throw e;
        }
    }
}
