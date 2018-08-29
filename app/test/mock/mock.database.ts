import { PaginateOptions, PaginateResult } from 'mongoose';
import { Service } from 'typedi';
import { GroupNotFound, UserNotFound } from '../../src/errors';
import { getLogger, Logger } from '../../src/logger';
import { ICompareDateModel, ICompareNumberModel } from '../../src/models/compare.date.model';
import { IGroupFilter } from '../../src/models/group.filter.model';
import { IGroupDocument } from '../../src/models/group.model';
import { IUserFilter } from '../../src/models/user.filter.model';
import { IUserDocument } from '../../src/models/user.model';
import { Group } from '../../src/schemas/group.schema';
import { User } from '../../src/schemas/user.schema';

interface IGroupFilterConditions extends IGroupFilter {
    _id?: string;
}

interface IUserFilgerConditions extends IUserFilter {
    _id?: string;
}

/**
 * Mocks DatabaseService
 */
@Service('MockDatabase')
export class MockDatabase {

    private logger: Logger;
    private db: boolean = false;

    constructor(public groups: IGroupDocument[] = [], public users: IUserDocument[] = []) {
        this.logger = getLogger('MockDatabase', ['test']);
    }

    public async connect(user: string, password: string, host: string, port: number) {
        this.logger.debug('Connecting to database', { user, password, host, port });
        if (this.db) {
            throw new Error('Database already connected');
        }
        this.db = true;
    }

    public async disconnect() {
        if (!this.db) {
            this.logger.warn('Databae not connected');
        }
        this.db = false;
    }

    public async findOneGroupBy(condition: IGroupFilterConditions) {
        this.logger.debug('FindOneGroupBy', { condition });
        try {
            return this._filterGroup(this.groups.slice(), condition)[0];
        } catch (e) {
            this.logger.error('FindOneGroupBy', e);
            throw e;
        }
    }

    public async filterGroup(conditions: IGroupFilter, pagination: PaginateOptions):
        Promise<PaginateResult<IGroupDocument>> {
        this.logger.debug('FilterGroup', { conditions, pagination });
        try {
            return this.paginate(this._filterGroup(this.groups.slice(), conditions), pagination);
        } catch (e) {
            this.logger.error('FilterGroup', e);
            throw e;
        }
    }

    public async createGroup(data: object) {
        this.logger.debug('CreateGroup', { data });
        try {
            const group = new Group({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await group.validate();
            this.groups.push(group);
            return group;
        } catch (e) {
            this.logger.error('CreateGroup', e);
            throw e;
        }
    }

    /**
     * Update group entry with given data
     * @param {string} id Group id
     * @param {object} data Update data
     */
    public async updateGroup(id: string, data: object): Promise<void> {
        this.logger.debug('UpdateGroup', { id, data });

        const group = this.groups.find(g => g._id.toString() === id);

        if (!group) {
            throw new GroupNotFound();
        }

        try {
            const updated = new Group({
                ...group.toObject(),
                ...data,
                createdAt: group.createdAt,
                updatedAt: new Date()
            });
            await updated.validate();
            this.groups = this.groups.map(g => g._id.toString() === id ? updated : g);
        } catch (err) {
            this.logger.error('UpdateGroup', err);
            throw err;
        }
    }

    /**
     * Remove group entry from database.
     * @param {string} id : Group id
     */
    public async deleteGroup(id: string): Promise<void> {
        this.logger.debug('DeleteGroup', { id });
        try {
            this.groups = this.groups.filter(g => g._id.toString() !== id);
        } catch (err) {
            this.logger.error('DeleteGroup', err);
            throw err;
        }
    }

    /**
     * Create new user
     * @param {object} data Create data
     */
    public async createUser(data: object): Promise<IUserDocument> {
        this.logger.debug('CreateUser', { data });
        try {
            const user = new User({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await user.validate();
            this.users.push(user);
            return user;
        } catch (e) {
            this.logger.error('CreateUser', e);
            throw e;
        }
    }

    /**
     * Update user entry with given data
     * @param {string} userId User id
     * @param {object} data Update data
     */
    public async updateUser(userId: string, data: object): Promise<void> {
        this.logger.debug('Updating user entery', { userId, data });

        const user = this.users.find(u => u.user === userId);

        if (!user) {
            throw new UserNotFound();
        }

        try {
            const updated = new User({
                ...user.toObject(),
                ...data,
                createdAt: user.createdAt,
                updatedAt: new Date()
            });
            await updated.validate();
            this.users = this.users.map(u => u._id.toString() === user._id.toString() ? updated : u);
        } catch (err) {
            this.logger.error('UpdateUser', err);
            throw err;
        }
    }

    /**
     * Remove user entry from database.
     * @param {string} userId : User id
     */
    public async deleteUser(userId: string): Promise<void> {
        this.logger.debug('DeleteUser', { userId });
        try {
            this.users = this.users.filter(u => u._id.toString() !== userId);
        } catch (err) {
            this.logger.error('DeleteUser', err);
            throw err;
        }
    }

    /**
     * Finds one user or null with given condition
     * @param {object} condition Query condition.
     * @returns {Promise<IUserDocument | null>}
     */
    public async findOneUserBy(condition: IUserFilgerConditions): Promise<IUserDocument | null> {
        try {
            this.logger.debug('FindOneUserBy', {condition});
            return this._filterUser(this.users.slice(), condition)[0];
        } catch (e) {
            this.logger.error('FindOneUserBy', e);
            throw e;
        }
    }

    /**
     * Filters users with given conditions
     * @param {IUserFilter} conditions: User Filters
     * @param {PaginateOptions} pagination
     * @returns {Promise<PaginateResult<IUserDocument>>}
     */
    public async filterUser(conditions: IUserFilter, pagination: PaginateOptions):
        Promise<PaginateResult<IUserDocument>> {
        this.logger.debug('FilterUser', { conditions, pagination });
        try {
            return this.paginate(this._filterUser(this.users.slice(), conditions), pagination);
        } catch (e) {
            this.logger.error('FilterUser', e);
            throw e;
        }
    }

    private _filterGroup(data: IGroupDocument[], conditions: IGroupFilterConditions): IGroupDocument[] {
        try {
            if (conditions._id) {
                data = data.filter(d => d._id.toString() === conditions._id);
            }
            if (conditions.count) {
                data = this.compare(data, 'count', conditions.count);
            }
            if (typeof conditions.name === "string") {
                data = data.filter(d => d.name === conditions.name);
            }
            if (typeof conditions.slug === "string") {
                data = data.filter(d => d.slug === conditions.slug);
            }
            if (conditions.createdAt) {
                data = this.compare(data, 'createdAt', conditions.createdAt);
            }
            if (conditions.updatedAt) {
                data = this.compare(data, 'updatedAt', conditions.updatedAt);
            }
            if (conditions.deletedAt) {
                data = this.compare(data, 'deletedAt', conditions.deletedAt);
            }
            if (typeof conditions.deleted === "boolean") {
                data = data.filter(d => d.deleted === conditions.deleted);
            }
            if (conditions.users && conditions.users.length > 0) {
                data = data.filter(d => {
                    for (const userId of d.users) {
                        if (userId in conditions.users) {
                            return true;
                        }
                    }
                    return false;
                });
            }
            return data;
        } catch (e) {
            this.logger.error('_filterGroup', e);
            throw e;
        }
    }

    private _filterUser(data: IUserDocument[], conditions: IUserFilgerConditions): IUserDocument[] {
        try {
            this.logger.debug('_FilterUser', {data, conditions});
            if (conditions._id) {
                data = data.filter(d => d._id.toString() === conditions._id);
            }
            if (typeof conditions.user === "string") {
                data = data.filter(d => d.user === conditions.user);
            }
            if (conditions.count) {
                data = this.compare(data, 'count', conditions.count);
            }
            if (conditions.createdAt) {
                data = this.compare(data, 'createdAt', conditions.createdAt);
            }
            if (conditions.updatedAt) {
                data = this.compare(data, 'updatedAt', conditions.updatedAt);
            }
            if (conditions.deletedAt) {
                data = this.compare(data, 'deletedAt', conditions.deletedAt);
            }
            if (typeof conditions.deleted === "boolean") {
                data = data.filter(d => d.deleted === conditions.deleted);
            }
            if (conditions.groups && conditions.groups.length > 0) {
                data = data.filter(d => {
                    for (const groupId of d.groups) {
                        if (groupId in conditions.groups) {
                            return true;
                        }
                    }
                    return false;
                });
            }
            return data;
        } catch (e) {
            this.logger.error('_filterUser', e);
            throw e;
        }
    }

    /**
     * Paginates given data
     * @param data
     * @param pagination
     */
    private paginate(data: any[], pagination: PaginateOptions): PaginateResult<any> {
        const page = pagination.page || 1;
        const limit = pagination.limit || 0;
        const offset = pagination.offset || 0;

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
        return {
            docs,
            total,
            offset,
            limit,
            page,
            pages
        };
    }

    private compare(data: any[], path: string, filter: ICompareDateModel | ICompareNumberModel): any[] {
        if (filter.eq !== undefined) {
            return data.filter(d => d[path] === filter.eq);
        }
        if (filter.gt !== undefined) {
            data = data.filter(d => d[path] > filter.gt);
        } else if (filter.gte !== undefined) {
            data = data.filter(d => d[path] >= filter.gte);
        }

        if (filter.lt !== undefined) {
            data = data.filter(d => d[path] < filter.lt);
        } else if (filter.lte !== undefined) {
            data = data.filter(d => d[path] <= filter.lte);
        }

        return data;
    }
}
