import { PaginateOptions, PaginateResult } from 'mongoose';
import { InvalidArgument, NotUserDocument, UserExists } from '../errors';
import { getLogger, Logger } from "../logger";
import { IUserFilter } from '../models/user.filter.model';
import { IUser, IUserDocument } from '../models/user.model';
import { User } from '../schemas/user.schema';
import { DatabaseService } from "./database.service";
import { GroupService } from './group.service';

export class UserService {
    private logger: Logger;

    constructor(private db: DatabaseService, private gs: GroupService) {
        this.logger = getLogger('UserService', ['service']);
    }

    /**
     * Get User entry
     * @param {string} id  User id
     * @param {boolean} deleted Is user entry deleted
     * @returns {Promise<IUser | null>} List of groups
     */
    public async get(id: string, deleted: boolean = false): Promise<IUser | null> {
        this.logger.info('Getting user groups from database', { id, deleted });

        if (typeof id !== 'string' || id.length !== 24) {
            throw new InvalidArgument('id');
        }

        if (typeof deleted !== 'boolean') {
            throw new InvalidArgument('deleted');
        }

        try {
            const user = await this.db.findOneUserBy({ id, deleted });
            return user ? this.toUser(user) : null;
        } catch (e) {
            this.logger.error('Getting user groups failed', e, { id, deleted });
            throw e;
        }
    }

    /**
     * Creates new user entry
     * @param id User id
     */
    public async create(id: string): Promise<IUser> {
        this.logger.debug('Create', {id});
        if (typeof id !== 'string' || id.length !== 24) {
            throw new InvalidArgument('id');
        }

        const user = await this.db.findOneUserBy({ id, deleted: false });

        if (user) {
            this.logger.warn('User already exists', {user});
            throw new UserExists();
        }

        try {
            return this.db.createUser(id, {}).then(doc => this.toUser(doc));
        } catch (e) {
            this.logger.error('Create', e);
            throw e;
        }
    }

    public async list(filters: IUserFilter, pagination: PaginateOptions = {limit: 10}): Promise<PaginateResult<IUser>> {
        try {
            this.logger.debug('List', {filters, pagination});
            return this.db.filterUser(filters, pagination);
        } catch (e) {
            this.logger.error('List', e);
            throw e;
        }
    }

    /**
     * Add user to group
     * @param {string} userId User id
     * @param {string} groupId Group id
     */
    public async add(userId: string, groupId: string): Promise<void> {
        if (typeof userId !== 'string' || userId.length !== 24) {
            throw new InvalidArgument('userId');
        }
        if (typeof groupId !== 'string' || groupId.length !== 24) {
            throw new InvalidArgument('groupId');
        }

        try {
            await Promise.all([
                this.addGroupToUser(userId, groupId),
                this.gs.addUserToGroup(userId, groupId)
            ]);
        } catch (e) {
            this.logger.error('User can not added to group', e, { userId, groupId });
            throw e;
        }
    }

    /**
     * Adds group realation to User entry
     * @param userId User id
     * @param groupId Group id
     */
    public async addGroupToUser(userId: string, groupId: string): Promise<void> {
        try {
            const entry = await this.db.findOneUserBy({ id: userId, deleted: false });

            if (entry) {
                this.logger.debug('User entry recived', { entry });
                const groups = new Set(entry.groups).add(groupId);
                await this.db.updateUser(userId, {
                    groups: [...groups],
                    count: groups.size
                });
            } else {
                this.logger.debug('User entry not found, creating.');
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

    public toUser(doc: IUserDocument): IUser {
        this.logger.debug('ToUser', {doc});
        if (!(doc instanceof User)) {
            throw new NotUserDocument();
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

    /**
     * Paginates given data
     * @param {T} data
     * @param {PaginateOptions} options
     * @returns {PaginateResult<T>}
     */
    public paginate<T = any>(data: T[], options: PaginateOptions = {}): PaginateResult<T> {
        this.logger.debug('Paginating data', { data, options });
        const page = options.page || 1;
        const limit = options.limit || 0;
        const offset = options.offset || 0;

        // Offset
        const offseted = data.slice(offset);

        const total = offseted.length;

        // Find pages
        let pages: number = 0;
        if (limit >= offseted.length) {
            pages = 1;
        } else {
            let count = 0;
            while (count < offseted.length) {
                count += limit;
                pages += 1;
            }
        }
        const start = limit * (page - 1);
        const end = limit ? start + limit : offseted.length;
        const docs = offseted.slice(start, end);
        const paginated = { docs, total, offset, limit, page, pages };
        this.logger.debug('Paginated', { paginated });
        return paginated;
    }
}
