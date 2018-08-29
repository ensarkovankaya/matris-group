import { connect, DocumentQuery, Mongoose, PaginateOptions, PaginateResult } from 'mongoose';
import { Service } from "typedi";
import { getLogger, Logger } from "../logger";
import { ICompareDateModel, ICompareNumberModel } from '../models/compare.date.model';
import { IGroupFilter } from '../models/group.filter.model';
import { IGroupDocument } from '../models/group.model';
import { IUserFilter } from '../models/user.filter.model';
import { IUserDocument } from '../models/user.model';
import { Group } from '../schemas/group.schema';
import { User } from '../schemas/user.schema';

@Service('DatabaseService')
export class DatabaseService {
    public logger: Logger;
    private db: Mongoose;

    constructor() {
        this.logger = getLogger('DatabaseService', ['service']);
    }

    /**
     * Connect to Database
     * @param {string} user: Database user name
     * @param {string} password: Database password
     * @param {string} host: Database host
     * @param {number} port: Database port
     * @return {Promise<void>}
     */
    public async connect(user: string, password: string, host: string, port: number): Promise<void> {
        try {
            this.logger.debug('Connecting to database', { user, host, port });
            this.db = await connect(`mongodb://${host}:${port}`, {
                user,
                pass: password
            });
            this.logger.info('Database connection succesfull');
        } catch (err) {
            this.logger.error('Database Connection Failed', err, { host, port, user });
            throw err;
        }
    }

    /**
     * Disconnects from database
     */
    public async disconnect(): Promise<void> {
        try {
            if (this.db) {
                this.logger.debug('Disconnecting to database.');
                await this.db.disconnect();
                this.logger.info('Disconnected to database.');
            } else {
                this.logger.warn('Database not connected.');
            }
        } catch (e) {
            this.logger.error('Database disconnection failed', e);
            throw e;
        }
    }

    /**
     * Finds one group or null with given condition
     * @param {object} condition Query condition.
     * @returns {Promise<IGroupDocument | null>}
     */
    public async findOneGroupBy(condition: object): Promise<IGroupDocument | null> {
        try {
            this.logger.debug('FindOneGroupBy', {condition});
            return await Group.findOne(condition).exec();
        } catch (e) {
            this.logger.error('FindOneGroupBy', e);
            throw e;
        }
    }

    /**
     * Create new group
     * @param {object} data Create data
     * @returns {Promise<IGroupDocument>}
     */
    public async createGroup(data: object): Promise<IGroupDocument> {
        this.logger.debug('CreateGroup', { data });
        try {
            return await new Group({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            }).save({ validateBeforeSave: true });
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
        try {
            await Group.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }).exec();
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
            await Group.findByIdAndRemove(id).exec();
        } catch (err) {
            this.logger.error('DeleteGroup', err);
            throw err;
        }
    }

    /**
     * Filters groups with given conditions
     * @param {IGroupFilter} conditions: Group Filters
     * @param {PaginateOptions} pagination
     * @returns {Promise<PaginateResult<IGroupDocument>>}
     */
    public async filterGroup(conditions: IGroupFilter, pagination: PaginateOptions = {}):
        Promise<PaginateResult<IGroupDocument>> {
        this.logger.debug('FilterGroup', { conditions, pagination });
        try {
            let query = Group.find();
            if (typeof conditions.deleted === 'boolean') {
                query = query.where('deleted', conditions.deleted);
            }
            if (conditions.deletedAt !== undefined) {
                query = this.compareQuery(query, 'deletedAt', conditions.deletedAt);
            }
            if (conditions.createdAt) {
                query = this.compareQuery(query, 'createdAt', conditions.createdAt);
            }
            if (conditions.updatedAt) {
                query = this.compareQuery(query, 'updatedAt', conditions.updatedAt);
            }
            if (typeof conditions.name === 'string') {
                query = query.where('name', conditions.name);
            }
            if (typeof conditions.slug === 'string') {
                query = query.where('slug', conditions.slug);
            }
            if (conditions.count) {
                query = this.compareQuery(query, 'count', conditions.count);
            }
            if (conditions.users) {
                query = query.where('users').in(conditions.users);
            }
            const queryObject = query.getQuery();
            this.logger.debug('FilterGroup', { query: queryObject });
            return await Group.paginate(queryObject, pagination);
        } catch (e) {
            this.logger.error('FilterGroup', e);
            throw e;
        }
    }

    /**
     * Finds one user or null with given condition
     * @param {object} condition Query condition.
     * @returns {Promise<IUserDocument | null>}
     */
    public async findOneUserBy(condition: object): Promise<IUserDocument | null> {
        try {
            this.logger.debug('FindOneUserBy', {condition});
            return await User.findOne(condition).exec();
        } catch (e) {
            this.logger.error('FindOneUserBy', e);
            throw e;
        }
    }

    /**
     * Create new user
     * @param {object} data Create data
     */
    public async createUser(data: object): Promise<IUserDocument> {
        this.logger.debug('CreateUser', { data });
        try {
            return await new User({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            }).save({ validateBeforeSave: true });
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
        this.logger.debug('UpdateUser', { userId, data });
        try {
            await User.findOneAndUpdate({ user: userId }, data).exec();
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
            await User.findOneAndRemove({ user: userId }).exec();
        } catch (err) {
            this.logger.error('DeleteUser', err);
            throw err;
        }
    }

    /**
     * Filters users with given conditions
     * @param {IUserFilter} conditions: User Filters
     * @param {PaginateOptions} pagination
     * @returns {Promise<PaginateResult<IUserDocument>>}
     */
    public async filterUser(conditions: IUserFilter, pagination: PaginateOptions = {}):
        Promise<PaginateResult<IUserDocument>> {
        this.logger.debug('FilterUser', { conditions, pagination });
        try {
            let query = User.find();
            if (typeof conditions.user === "string") {
                query = query.where('user', conditions.user);
            }
            if (typeof conditions.deleted === 'boolean') {
                query = query.where('deleted', conditions.deleted);
            }
            if (conditions.deletedAt !== undefined) {
                query = this.compareQuery(query, 'deletedAt', conditions.deletedAt);
            }
            if (conditions.createdAt) {
                query = this.compareQuery(query, 'createdAt', conditions.createdAt);
            }
            if (conditions.updatedAt) {
                query = this.compareQuery(query, 'updatedAt', conditions.updatedAt);
            }
            if (conditions.count) {
                query = this.compareQuery(query, 'count', conditions.count);
            }
            if (conditions.groups) {
                query = query.where('groups').in(conditions.groups);
            }
            const queryObject = query.getQuery();
            this.logger.debug('FilterUser', { query: queryObject });
            return await User.paginate(queryObject, pagination);
        } catch (e) {
            this.logger.error('FilterUser', e);
            throw e;
        }
    }

    private compareQuery(
        query: DocumentQuery<any[], any>,
        path: string,
        filter: ICompareDateModel | ICompareNumberModel) {
        if (filter.eq !== undefined) {
            return query.where(path, filter.eq);
        }
        if (filter.gt !== undefined) {
            query = query.where(path).gt(filter.gt as any);
        } else if (filter.gte !== undefined) {
            query = query.where(path).gte(filter.gte as any);
        }
        if (filter.lt !== undefined) {
            query = query.where(path).lt(filter.lt as any);
        } else if (filter.lte !== undefined) {
            query = query.where(path).lte(filter.lte as any);
        }
        return query;
    }
}
