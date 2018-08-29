import { PaginateOptions, PaginateResult } from 'mongoose';
import slugify from 'slugify';
import { Service } from "typedi";
import { GroupNotFound, InvalidArgument, PaginationError } from '../errors';
import { Group } from '../graphql/schemas/group.schema';
import { getLogger, Logger } from "../logger";
import { IGroupFilter } from '../models/group.filter.model';
import { IGroup, IGroupDocument } from '../models/group.model';
import { DatabaseService } from './database.service';

@Service('GroupService')
export class GroupService {

    private logger: Logger;

    constructor(private db: DatabaseService) {
        this.logger = getLogger('GroupService', ['service']);
    }

    /**
     * Transform mongoose group object to Group object
     * @param {IGroupDocument} doc Mongoose object
     */
    public toGroup(doc: IGroupDocument): IGroup {
        return {
            id: doc._id.toString(),
            name: doc.name,
            slug: doc.slug,
            users: doc.users,
            count: doc.count,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            deletedAt: doc.deletedAt,
            deleted: doc.deleted
        };
    }

    /**
     * Create group entry
     * @param {string} name Group name
     * @returns {IGroup}
     */
    public async create(name: string): Promise<IGroup> {
        if (typeof name !== 'string' || name.length < 1) {
            throw new InvalidArgument('name');
        }
        try {
            const slug = this.normalize(name.trim().toLowerCase());
            return await this.db.createGroup({ name, slug }).then(this.toGroup);
        } catch (e) {
            this.logger.error('Group can not created', e, { name });
            throw e;
        }
    }

    /**
     * Update group entry
     * @param {string} groupId Group id
     * @param {string} name New group name
     */
    public async update(groupId: string, name: string): Promise<void> {
        if (typeof name !== 'string' || name.length <= 0) {
            throw new InvalidArgument('name');
        }

        if (typeof groupId !== 'string' || groupId.length !== 24) {
            throw new InvalidArgument('groupId');
        }

        const group = await this.db.findOneGroupBy({ _id: groupId, deleted: false });

        if (!group) {
            throw new GroupNotFound();
        }

        try {
            const slug = this.normalize(name.trim().toLowerCase());
            await this.db.updateGroup(groupId, { name, slug });
        } catch (e) {
            this.logger.error('Group can not updated', e, { groupId, name });
            throw e;
        }
    }

    /**
     * Add user to group
     * @param {string} userId User id
     * @param {string} groupId Group id
     */
    public async addUser(userId: string, groupId: string): Promise<void> {
        if (typeof userId !== 'string' || userId.length !== 24) {
            throw new InvalidArgument('userId');
        }
        if (typeof groupId !== 'string' || groupId.length !== 24) {
            throw new InvalidArgument('groupId');
        }

        try {
            await Promise.all([
                this.addGroupToUser(userId, groupId),
                this.addUserToGroup(userId, groupId)
            ]);
        } catch (e) {
            this.logger.error('User can not added to group', e, { userId, groupId });
            throw e;
        }
    }

    /**
     * Remove user from given group
     * @param userId User id
     * @param groupId Group id
     */
    public async removeUser(userId: string, groupId: string): Promise<void> {
        if (typeof userId !== 'string' || userId.length !== 24) {
            throw new InvalidArgument('userId');
        }
        if (typeof groupId !== 'string' || groupId.length !== 24) {
            throw new InvalidArgument('groupId');
        }
        try {
            await Promise.all([
                this.removeGroupFromUser(userId, groupId),
                this.removeUserFromGroup(userId, groupId)
            ]);
        } catch (e) {
            this.logger.error('User can not remove from group', e, { userId, groupId });
            throw e;
        }
    }

    /**
     * Delete's group with given id
     * @param id Group id
     */
    public async delete(id: string) {
        if (typeof id !== 'string' || id.length !== 24) {
            throw new InvalidArgument('group');
        }
        const group = await this.db.findOneGroupBy({ _id: id, deleted: false });
        if (!group) {
            throw new GroupNotFound();
        }

        try {
            // Remove group from all related users
            await Promise.all(group.users.map(user => this.removeGroupFromUser(user, id)));

            // Mark group as deleted
            await this.db.updateGroup(id, { deleted: true, deletedAt: new Date() });
        } catch (e) {
            this.logger.error('Group can not deleted', e, { id });
            throw e;
        }
    }

    /**
     * Reverse effects of delete method for deleted group. Add group to all users.
     * @param id Group id
     */
    public async undelete(id: string) {
        const group = await this.db.findOneGroupBy({ _id: id, deleted: true });

        if (!group) {
            throw new GroupNotFound();
        }
        try {
            // Add group to all related users
            await Promise.all(group.users.map(user => this.addGroupToUser(user, id)));
            // Update group as not deleted
            await this.db.updateGroup(id, { deleted: false, deletedAt: null });
        } catch (e) {
            this.logger.error('Undeletion failed', e);
            throw e;
        }
    }

    /**
     * Retrieve one group from database with given id, name or slug.
     * @param {object} by Query parameters
     * @param {string} by.id Group id
     * @param {string} by.name Group name
     * @param {string} by.slug Group slug
     * @param {boolean} deleted Is group deleted. Default false.
     * @returns {Promise<IGroup | null>}
     */
    public async get(by: { id?: string, name?: string, slug?: string }, deleted: boolean = false):
        Promise<IGroup | null> {
        this.logger.info('Getting group', { by });
        if (typeof by !== 'object' || (!by.id && !by.name && !by.slug)) {
            throw new InvalidArgument('by');
        }
        if (typeof deleted !== 'boolean') {
            throw new InvalidArgument('deleted');
        }
        if (by.id !== undefined && typeof by.id !== 'string') {
            throw new InvalidArgument('by.id');
        }
        if (by.name !== undefined && typeof by.name !== 'string') {
            throw new InvalidArgument('by.name');
        }
        if (by.slug !== undefined && typeof by.slug !== 'string') {
            throw new InvalidArgument('by.slug');
        }

        let group: IGroupDocument | null = null;
        try {
            if (by.id) {
                group = await this.db.findOneGroupBy({ _id: by.id, deleted });
            } else if (by.name) {
                group = await this.db.findOneGroupBy({ name: by.name, deleted });
            } else if (by.slug) {
                group = await this.db.findOneGroupBy({ slug: by.slug, deleted });
            }
            return group ? this.toGroup(group) : null;
        } catch (e) {
            this.logger.error('Getting group failed', e, { by });
            throw e;
        }
    }

    /**
     * Slugifies string
     * @see https://www.npmjs.com/package/slugify
     * @param {string} value : String
     * @returns {string} Normalized string
     */
    public normalize(value: string): string {
        if (typeof value !== 'string') {
            throw new InvalidArgument('value');
        }
        // Trim, Normalize and Lowercase
        value = value.trim().normalize().toLowerCase();

        // Replace Turkish characters
        value = value
            .replace(new RegExp('ğ', 'g'), 'g')
            .replace(new RegExp('Ğ', 'g'), 'g')
            .replace(new RegExp('ü', 'g'), 'u')
            .replace(new RegExp('Ü', 'g'), 'u')
            .replace(new RegExp('ç', 'g'), 'c')
            .replace(new RegExp('Ç', 'g'), 'c')
            .replace(new RegExp('ş', 'g'), 's')
            .replace(new RegExp('Ş', 'g'), 's')
            .replace(new RegExp('ı', 'g'), 'i')
            .replace(new RegExp('I', 'g'), 'i')
            .replace(new RegExp('ö', 'g'), 'o')
            .replace(new RegExp('Ö', 'g'), 'o');

        // Remove unwanted characters
        value = value.replace(new RegExp('[^a-zA-Z0-9 -]', 'g'), '');
        return slugify(value);
    }

    /**
     * Returns list of Groups with given filter. If not filter will given returns all groups.
     * @param {IGroupFilter} filters Filters
     * @returns {Promise<PaginateResult<IGroup>>}
     */
    public async list(filters: IGroupFilter = {}, pagination: PaginateOptions = { limit: 10 }):
        Promise<PaginateResult<IGroup>> {
        try {
            this.logger.debug('List', {filters, pagination});
            const result = await this.db.filterGroup(filters, pagination);
            this.logger.debug('List', {result});
            return { ...result, docs: result.docs.map(this.toGroup) };
        } catch (e) {
            this.logger.error('List', e);
            throw e;
        }
    }

    /**
     * Remove Group relation from User entry
     * @param userId User id
     * @param groupId Group id
     */
    public async removeGroupFromUser(userId: string, groupId: string): Promise<void> {
        try {
            const entry = await this.db.findOneUserBy({ id: userId, deleted: false });
            this.logger.debug('User entry get from database', { entry });
            if (entry) {
                const groups = new Set(entry.groups);
                groups.delete(groupId);
                await this.db.updateUser(userId, { groups: [...groups], count: groups.size });
            } else {
                this.logger.warn('User entry not found.', { userId, groupId });
            }
        } catch (e) {
            this.logger.error('Removing group relation from user failed', e, { userId, groupId });
            throw e;
        }
    }

    /**
     * Remove User relation from Group entry
     * @param userId User id
     * @param groupId Group id
     */
    public async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
        try {
            const group = await this.db.findOneGroupBy({ _id: groupId, deleted: false });

            if (!group) {
                throw new GroupNotFound();
            }

            const users = new Set(group.users);
            users.delete(userId);
            await this.db.updateGroup(groupId, {
                users: [...users],
                count: users.size
            });
        } catch (e) {
            this.logger.error('Removing user relation from group failed', e, { userId, groupId });
            throw e;
        }
    }

    /**
     * Add user relation to Group entry.
     * @param userId User id
     * @param groupId Group id
     */
    public async addUserToGroup(userId: string, groupId: string): Promise<void> {
        const group = await this.db.findOneGroupBy({ _id: groupId, deleted: false });
        if (!group) {
            throw new GroupNotFound();
        }

        try {
            const users = new Set(group.users).add(userId);
            await this.db.updateGroup(groupId, {
                users: [...users],
                count: users.size
            });
        } catch (e) {
            this.logger.error('Adding user to group entry failed', e, { userId, groupId });
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
}
