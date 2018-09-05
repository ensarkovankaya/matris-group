import { PaginateOptions, PaginateResult } from 'mongoose';
import slugify from 'slugify';
import { Service } from "typedi";
import { GroupExists, GroupNotFound, InvalidArgument, InvalidDocument } from '../errors';
import { getLogger, Logger } from "../logger";
import { IGroupFilter } from '../models/group.filter.model';
import { IGroup, IGroupDocument } from '../models/group.model';
import { Group } from '../schemas/group.schema';
import { DatabaseService } from './database.service';

@Service('GroupService')
export class GroupService {

    /**
     * Transform mongoose group object to Group object
     * @param {IGroupDocument} doc Mongoose object
     */
    public static toGroup(doc: IGroupDocument): IGroup {
        if (!(doc instanceof Group)) {
            throw new InvalidDocument('Document must be a Group instance.');
        }
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
     * Slugifies string
     * @see https://www.npmjs.com/package/slugify
     * @param {string} value : String
     * @returns {string} Normalized string
     */
    public static normalize(value: string): string {
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

    private logger: Logger;

    constructor(private db: DatabaseService) {
        this.logger = getLogger('GroupService', ['service']);
    }

    /**
     * Create group entry
     * @param {string} name Group name
     * @returns {IGroup}
     */
    public async create(name: string): Promise<IGroup> {
        if (typeof name !== 'string') {
            throw new InvalidArgument('name', 'Group name must be a string.');
        }
        if (name.length < 1) {
            throw new InvalidArgument('name', 'Group name must be at least 1 character.');
        }
        if (name.length > 32) {
            throw new InvalidArgument('name', 'Group name must be shorter than 32 character.');
        }

        const slug = GroupService.normalize(name);

        // Check group already exists
        const group = await this.db.findOneGroupBy({ slug, deleted: false });
        if (group) {
            this.logger.warn('Another group exists with same name.', { group });
            throw new GroupExists(`Group already exists with name "${name}".`);
        }

        try {
            return await this.db.createGroup({ name, slug }).then(GroupService.toGroup);
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
        if (typeof groupId !== 'string') {
            throw new InvalidArgument('groupId', 'Group id must be a string.');
        }

        if (groupId.length !== 24) {
            throw new InvalidArgument('groupId', 'Invalid group id.');
        }

        if (typeof name !== 'string') {
            throw new InvalidArgument('name', 'Group name must be a string.');
        }
        if (name.length < 1) {
            throw new InvalidArgument('name', 'Group name must be at least 1 character.');
        }
        if (name.length > 32) {
            throw new InvalidArgument('name', 'Group name must be shorter than 32 character.');
        }

        const updateGroup = await this.db.findOneGroupBy({ _id: groupId, deleted: false });

        if (!updateGroup) {
            throw new GroupNotFound(`Group not found with id "${groupId}".`);
        }

        // If name already same do not update
        if (updateGroup.name === name) {
            this.logger.warn('Group current name is same with update name');
            return;
        }

        // check another group exists with same name
        const slug = GroupService.normalize(name);
        const group = await this.db.findOneGroupBy({ slug, deleted: false });

        if (group && group._id.toString() !== updateGroup._id.toString()) {
            throw new GroupExists(`Another group exists with name "${name}".`);
        }

        try {
            await this.db.updateGroup(groupId, { name, slug });
        } catch (e) {
            this.logger.error('Group can not updated', e, { groupId, name });
            throw e;
        }
    }

    /**
     * Delete's group with given id
     * @param id Group id
     */
    public async delete(id: string) {
        if (typeof id !== 'string' || id.length !== 24) {
            throw new InvalidArgument('group', 'Id invalid');
        }

        const group = await this.db.findOneGroupBy({ _id: id, deleted: false });
        if (!group) {
            throw new GroupNotFound(`Group not found with id "${id}".`);
        }

        try {
            // Mark group as deleted
            await this.db.updateGroup(id, { deleted: true, deletedAt: new Date() });
        } catch (e) {
            this.logger.error('Group can not deleted', e, { id });
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
        this.logger.info('Getting group', { by, deleted });
        if (typeof by !== 'object' || (by.id === undefined && by.name === undefined && by.slug === undefined)) {
            throw new InvalidArgument('by');
        }
        if (typeof deleted !== 'boolean') {
            throw new InvalidArgument('deleted');
        }
        if (by.id !== undefined && (typeof by.id !== 'string' || by.id.length !== 24)) {
            throw new InvalidArgument('by.id', 'Id must be a string and length of 24.');
        }

        if (by.name !== undefined && typeof by.name !== 'string') {
            throw new InvalidArgument('by.name', 'Name must be a string.');
        }
        if (typeof by.name === "string" && (by.name.length < 1 || by.name.length > 35)) {
            throw new InvalidArgument('by.name', 'Name length invalid.');
        }

        if (by.slug !== undefined && typeof by.slug !== 'string') {
            throw new InvalidArgument('by.slug', 'Slug must be a string.');
        }
        if (typeof by.slug === "string" && GroupService.normalize(by.slug) !== by.slug) {
            throw new InvalidArgument('by.slug', 'Slug contains invalid characters.');
        }
        if (typeof by.slug === "string" && (by.slug.length < 1 || by.slug.length > 35)) {
            throw new InvalidArgument('by.slug', 'Slug length invalid.');
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
            return group ? GroupService.toGroup(group) : null;
        } catch (e) {
            this.logger.error('Getting group failed', e, { by, deleted });
            throw e;
        }
    }

    /**
     * Returns list of Groups with given filter. If not filter will given returns all groups.
     * @param {IGroupFilter} filters Filters
     * @returns {Promise<PaginateResult<IGroup>>}
     */
    public async list(filters: IGroupFilter = {}, pagination: PaginateOptions = { limit: 10 }):
        Promise<PaginateResult<IGroup>> {
        this.logger.info('Listing groups.', { filters, pagination });

        try {
            const result = await this.db.filterGroup(filters, pagination);
            this.logger.debug('List result', { result });
            return {
                docs: result.docs.map(GroupService.toGroup),
                total: result.total,
                limit: result.limit,
                page: result.page,
                pages: result.pages,
                offset: result.offset
            };
        } catch (e) {
            this.logger.error('Listing groups failed.', e);
            throw e;
        }
    }

    /**
     * Add user relation to Group entry.
     * @param userId User id
     * @param groupId Group id
     */
    public async add(userId: string, groupId: string): Promise<void> {
        if (typeof userId !== 'string' || userId.length !== 24) {
            throw new InvalidArgument('userId', 'User id invalid.');
        }
        if (typeof groupId !== 'string' || groupId.length !== 24) {
            throw new InvalidArgument('userId', 'Group id invalid.');
        }

        const group = await this.db.findOneGroupBy({ _id: groupId, deleted: false });
        if (!group) {
            throw new GroupNotFound();
        }

        try {
            const users = new Set(group.users);

            // If user already in group do not perform db update
            if (users.has(userId)) {
                this.logger.warn('User already in group.', { userId, groupId });
                return;
            }

            users.add(userId);
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
     * Remove User relation from Group entry.
     * @param {string} userId User id
     * @param {string} groupId Group id
     */
    public async remove(userId: string, groupId: string): Promise<void> {
        if (typeof userId !== 'string' || userId.length !== 24) {
            throw new InvalidArgument('userId', 'User id invalid.');
        }
        if (typeof groupId !== 'string' || groupId.length !== 24) {
            throw new InvalidArgument('groupId', 'Group id invalid.');
        }

        const group = await this.db.findOneGroupBy({ _id: groupId, deleted: false });
        if (!group) {
            throw new GroupNotFound(`Group not found with id "${groupId}".`);
        }

        try {
            const users = new Set(group.users);
            const deleted = users.delete(userId);
            // If user not in group do not perform db update
            if (!deleted) {
                this.logger.warn('User already not in group.', { userId, groupId });
                return;
            }

            await this.db.updateGroup(groupId, {
                users: [...users],
                count: users.size
            });
        } catch (e) {
            this.logger.error('Removing user relation from group failed', e, { userId, groupId });
            throw e;
        }
    }
}
