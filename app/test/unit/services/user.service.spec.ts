import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { User } from '../../../src/schemas/user.schema';
import { UserService } from '../../../src/services/user.service';
import { MockDatabase } from '../../mock/mock.database';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Services -> UserService', () => {
    describe('ToUser', () => {
        it('should transform empty User document to User object', async () => {
            const u = new User({id: '1'.repeat(24)});
            const obj = UserService.toUser(u);
            expect(obj).to.be.an('object');
            expect(obj).to.have.keys(['id', 'count', 'groups', 'createdAt', 'updatedAt', 'deletedAt', 'deleted']);
            expect(obj.id).to.be.eq(u.id);
            expect(obj.count).to.be.eq(u.count);
            expect(obj.groups).to.be.deep.eq(u.groups);
            expect(obj.createdAt).to.be.eq(u.createdAt);
            expect(obj.updatedAt).to.be.eq(u.updatedAt);
            expect(obj.deletedAt).to.be.eq(u.deletedAt);
            expect(obj.deleted).to.be.eq(u.deleted);
        });

        it('should transform User document to User object', async () => {
            const u = new User({id: '1'.repeat(24), count: 1, groups: ['2'.repeat(24)]});
            const obj = UserService.toUser(u);
            expect(obj).to.be.an('object');
            expect(obj).to.have.keys(['id', 'count', 'groups', 'createdAt', 'updatedAt', 'deletedAt', 'deleted']);
            expect(obj.id).to.be.eq(u.id);
            expect(obj.count).to.be.eq(u.count);
            expect(obj.groups).to.be.deep.eq(u.groups);
            expect(obj.createdAt).to.be.eq(u.createdAt);
            expect(obj.updatedAt).to.be.eq(u.updatedAt);
            expect(obj.deletedAt).to.be.eq(u.deletedAt);
            expect(obj.deleted).to.be.eq(u.deleted);
        });

        it('should raise InvalidDocument for empty object', () => {
            try {
                UserService.toUser({} as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidDocument');
            }
        });

        it('should raise InvalidDocument', () => {
            try {
                UserService.toUser({
                    id: '1'.repeat(24),
                    count: 0,
                    groups: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deleted: false,
                    deletedAt: null
                } as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidDocument');
            }
        });
    });

    describe('Add', () => {
        it('should create new user entry', async () => {
            const db = new MockDatabase();
            const service = new UserService(db as any);

            await service.add('1'.repeat(24), '2'.repeat(24));

            const user = db.users[0];
            expect(user).to.instanceof(User);
            expect(user.count).to.be.eq(1);
            expect(user.groups).to.have.lengthOf(1);
            expect(user.groups).to.be.deep.eq(['2'.repeat(24)]);
        });

        it('should update existing user entry', async () => {
            const u = new User({id: '1'.repeat(24)});
            const db = new MockDatabase([], [u]);
            const service = new UserService(db as any);

            await service.add('1'.repeat(24), '2'.repeat(24));

            const user = db.users[0];
            expect(user).to.be.instanceof(User);
            expect(user._id.toString()).to.be.eq(u._id.toString());
            expect(user.count).to.be.eq(1);
            expect(user.groups).to.have.lengthOf(1);
            expect(user.groups).to.be.deep.eq(['2'.repeat(24)]);
        });
    });

    describe('Get', () => {
        it('should return user groups', async () => {
            const u = new User({id: '1'.repeat(24), count: 2, groups: ['2'.repeat(24), '3'.repeat(24)]});
            const db = new MockDatabase([], [u]);
            const service = new UserService(db as any);

            const user = await service.get('1'.repeat(24));

            expect(user).to.be.an('object');
            expect(user).to.have.keys(['id', 'count', 'groups', 'createdAt', 'updatedAt', 'deletedAt', 'deleted']);
            expect(user.id).to.be.eq('1'.repeat(24));
            expect(user.count).to.be.eq(2);
            expect(user.groups).to.be.deep.eq(['2'.repeat(24), '3'.repeat(24)]);
            expect(user.createdAt).to.be.eq(u.createdAt);
            expect(user.updatedAt).to.be.eq(u.updatedAt);
            expect(user.deletedAt).to.be.eq(u.deletedAt);
            expect(user.deleted).to.be.eq(u.deleted);
        });

        it('should return no groups for not existing user', async () => {
            const db = new MockDatabase();
            const service = new UserService(db as any);
            const user = await service.get('1'.repeat(24));
            expect(user).to.be.eq(null);
        });
    });

    describe('Create', () => {
        it('should raise InvalidArgument if id is not a string', async () => {
            try {
                const db = new MockDatabase();
                const service = new UserService(db as any);
                await service.create(1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('id');
            }
        });

        it('should raise InvalidArgument if id is shorter than 23', async () => {
            try {
                const db = new MockDatabase();
                const service = new UserService(db as any);
                await service.create('1'.repeat(23));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('id');
            }
        });

        it('should raise InvalidArgument if id is longer than 24', async () => {
            try {
                const db = new MockDatabase();
                const service = new UserService(db as any);
                await service.create('1'.repeat(25));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('id');
            }
        });

        it('should raise UserExists if user already exists', async () => {
            const db = new MockDatabase([], [new User({id: '1'.repeat(24)})]);
            try {
                const service = new UserService(db as any);
                await service.create('1'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('UserExists');
            }
        });

        it('should create user', async () => {
            const db = new MockDatabase();
            const service = new UserService(db as any);
            const user = await service.create('1'.repeat(24));

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneUserBy',
                    arguments: {
                        0: {
                            id: '1'.repeat(24),
                            deleted: false
                        }
                    }
                },
                {
                    method: 'createUser',
                    arguments: {
                        0: '1'.repeat(24),
                        1: {}
                    }
                }
            ]);

            expect(user).to.be.an('object');
            expect(user).to.have.keys(['id', 'count', 'groups', 'createdAt', 'updatedAt', 'deletedAt', 'deleted']);
            expect(user.id).to.be.eq('1'.repeat(24));
            expect(user.count).to.be.eq(0);
            expect(user.groups).to.be.deep.eq([]);
            expect(user.createdAt).to.be.a('date');
            expect(user.updatedAt).to.be.a('date');
            expect(user.deletedAt).to.be.eq(null);
            expect(user.deleted).to.be.eq(false);
        });
    });

    describe('Delete', () => {
        it('should raise InvalidArgument if id is not a string', async () => {
            try {
                const db = new MockDatabase();
                const service = new UserService(db as any);
                await service.delete(1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('id');
            }
        });

        it('should raise InvalidArgument if id is shorter than 23', async () => {
            try {
                const db = new MockDatabase();
                const service = new UserService(db as any);
                await service.delete('1'.repeat(23));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('id');
            }
        });

        it('should raise InvalidArgument if id is longer than 24', async () => {
            try {
                const db = new MockDatabase();
                const service = new UserService(db as any);
                await service.delete('1'.repeat(25));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('id');
            }
        });

        it('should raise UserNotFound if user already exists', async () => {
            try {
                const db = new MockDatabase();
                const service = new UserService(db as any);
                await service.delete('1'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('UserNotFound');
            }
        });

        it('should mark user as deleted', async () => {
            const db = new MockDatabase([], [new User({id: '1'.repeat(24), count: 1, groups: ['2'.repeat(24)]})]);
            const service = new UserService(db as any);
            await service.delete('1'.repeat(24));

            expect(db.stack).to.have.lengthOf(2);
            const s1 = db.stack[0];
            expect(s1).to.be.deep.eq({
                method: 'findOneUserBy',
                arguments: {
                    0: {
                        id: '1'.repeat(24),
                        deleted: false
                    }
                }
            });

            const s2 = db.stack[1];
            expect(s2).to.be.an('object');
            expect(s2).to.have.keys(['method', 'arguments']);
            expect(s2.method).to.be.eq('updateUser');
            expect(s2.arguments).to.be.an('object');
            expect(s2.arguments).to.have.keys(['0', '1']);
            expect(s2.arguments['0']).to.be.eq('1'.repeat(24));
            expect(s2.arguments['1']).to.be.an('object');
            expect(s2.arguments['1']).to.have.keys(['deleted', 'deletedAt']);
            expect(s2.arguments['1'].deleted).to.be.eq(true);
            expect(s2.arguments['1'].deletedAt).to.be.a('date');
        });
    });

    describe('List', () => {
        describe('pagination', () => {
            describe('limit', () => {
                it('should return list of user entries with pagination limit 5', async () => {
                    const u1 = new User({id: '1'.repeat(24)});
                    const u2 = new User({id: '2'.repeat(24)});
                    const u3 = new User({id: '3'.repeat(24)});
                    const u4 = new User({id: '4'.repeat(24)});
                    const u5 = new User({id: '5'.repeat(24)});
                    const u6 = new User({id: '6'.repeat(24)});
                    const u7 = new User({id: '7'.repeat(24)});
                    const u8 = new User({id: '8'.repeat(24)});
                    const db = new MockDatabase([], [u1, u2, u3, u4, u5, u6, u7, u8]);
                    const service = new UserService(db as any);

                    const result = await service.list({}, {limit: 5});
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
                    expect(result.total).to.be.eq(8);
                    expect(result.page).to.be.eq(1);
                    expect(result.limit).to.be.eq(5);
                    expect(result.pages).to.be.eq(2);
                    expect(result.offset).to.be.eq(0);
                    expect(result.docs).to.have.lengthOf(5);
                    expect(result.docs.map(d => d.id)).to.be.deep.eq([u1.id, u2.id, u3.id, u4.id, u5.id]);
                });

                it('should return list of user entries with pagination limit 10', async () => {
                    const u1 = new User({id: '1'.repeat(24)});
                    const u2 = new User({id: '2'.repeat(24)});
                    const u3 = new User({id: '3'.repeat(24)});
                    const u4 = new User({id: '4'.repeat(24)});
                    const u5 = new User({id: '5'.repeat(24)});
                    const u6 = new User({id: '6'.repeat(24)});
                    const u7 = new User({id: '7'.repeat(24)});
                    const u8 = new User({id: '8'.repeat(24)});
                    const db = new MockDatabase([], [u1, u2, u3, u4, u5, u6, u7, u8]);
                    const service = new UserService(db as any);

                    const result = await service.list({}, {limit: 10});
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
                    expect(result.total).to.be.eq(8);
                    expect(result.page).to.be.eq(1);
                    expect(result.limit).to.be.eq(10);
                    expect(result.pages).to.be.eq(1);
                    expect(result.offset).to.be.eq(0);
                    expect(result.docs).to.have.lengthOf(8);
                    expect(result.docs.map(d => d.id)).to.be.deep.eq([
                        u1.id, u2.id, u3.id, u4.id, u5.id, u6.id, u7.id, u8.id
                    ]);
                });
            });

            describe('page', () => {
                it('should return list of user entries with pagination page 2', async () => {
                    const u1 = new User({id: '1'.repeat(24)});
                    const u2 = new User({id: '2'.repeat(24)});
                    const u3 = new User({id: '3'.repeat(24)});
                    const u4 = new User({id: '4'.repeat(24)});
                    const u5 = new User({id: '5'.repeat(24)});
                    const u6 = new User({id: '6'.repeat(24)});
                    const u7 = new User({id: '7'.repeat(24)});
                    const u8 = new User({id: '8'.repeat(24)});
                    const db = new MockDatabase([], [u1, u2, u3, u4, u5, u6, u7, u8]);
                    const service = new UserService(db as any);

                    const result = await service.list({}, {page: 2, limit: 5});
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
                    expect(result.total).to.be.eq(8);
                    expect(result.page).to.be.eq(2);
                    expect(result.limit).to.be.eq(5);
                    expect(result.pages).to.be.eq(2);
                    expect(result.offset).to.be.eq(0);
                    expect(result.docs).to.have.lengthOf(3);
                    expect(result.docs.map(d => d.id)).to.be.deep.eq([u6.id, u7.id, u8.id]);
                });

                it('should return list of user entries with pagination page 1', async () => {
                    const u1 = new User({id: '1'.repeat(24)});
                    const u2 = new User({id: '2'.repeat(24)});
                    const u3 = new User({id: '3'.repeat(24)});
                    const u4 = new User({id: '4'.repeat(24)});
                    const u5 = new User({id: '5'.repeat(24)});
                    const u6 = new User({id: '6'.repeat(24)});
                    const u7 = new User({id: '7'.repeat(24)});
                    const u8 = new User({id: '8'.repeat(24)});
                    const db = new MockDatabase([], [u1, u2, u3, u4, u5, u6, u7, u8]);
                    const service = new UserService(db as any);

                    const result = await service.list({}, {page: 1, limit: 5});
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
                    expect(result.total).to.be.eq(8);
                    expect(result.page).to.be.eq(1);
                    expect(result.limit).to.be.eq(5);
                    expect(result.pages).to.be.eq(2);
                    expect(result.offset).to.be.eq(0);
                    expect(result.docs).to.have.lengthOf(5);
                    expect(result.docs.map(d => d.id)).to.be.deep.eq([u1.id, u2.id, u3.id, u4.id, u5.id]);
                });
            });
        });

        describe('filters', () => {
            describe('count', () => {
                it('should return list of user entries with count equal to 2', async () => {
                    const u1 = new User({id: '1'.repeat(24), count: 1});
                    const u2 = new User({id: '2'.repeat(24), count: 1});
                    const u3 = new User({id: '3'.repeat(24), count: 2});
                    const u4 = new User({id: '4'.repeat(24), count: 3});
                    const u5 = new User({id: '5'.repeat(24), count: 3});
                    const u6 = new User({id: '6'.repeat(24), count: 4});
                    const db = new MockDatabase([], [u1, u2, u3, u4, u5, u6]);
                    const service = new UserService(db as any);

                    const result = await service.list({count: {eq: 2}});
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
                    expect(result.total).to.be.eq(1);
                    expect(result.page).to.be.eq(1);
                    expect(result.limit).to.be.eq(10);
                    expect(result.pages).to.be.eq(1);
                    expect(result.offset).to.be.eq(0);
                    expect(result.docs).to.have.lengthOf(1);
                    expect(result.docs.map(d => d.id)).to.be.deep.eq([u3.id]);
                });

                it('should return list of user entries with count greater than 2', async () => {
                    const u1 = new User({id: '1'.repeat(24), count: 1});
                    const u2 = new User({id: '2'.repeat(24), count: 1});
                    const u3 = new User({id: '3'.repeat(24), count: 2});
                    const u4 = new User({id: '4'.repeat(24), count: 3});
                    const u5 = new User({id: '5'.repeat(24), count: 3});
                    const u6 = new User({id: '6'.repeat(24), count: 4});
                    const db = new MockDatabase([], [u1, u2, u3, u4, u5, u6]);
                    const service = new UserService(db as any);

                    const result = await service.list({count: {gt: 2}});
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
                    expect(result.total).to.be.eq(3);
                    expect(result.page).to.be.eq(1);
                    expect(result.limit).to.be.eq(10);
                    expect(result.pages).to.be.eq(1);
                    expect(result.offset).to.be.eq(0);
                    expect(result.docs).to.have.lengthOf(3);
                    expect(result.docs.map(d => d.id)).to.be.deep.eq([u4.id, u5.id, u6.id]);
                });

                it('should return list of user entries with count less than 2', async () => {
                    const u1 = new User({id: '1'.repeat(24), count: 1});
                    const u2 = new User({id: '2'.repeat(24), count: 1});
                    const u3 = new User({id: '3'.repeat(24), count: 2});
                    const u4 = new User({id: '4'.repeat(24), count: 3});
                    const u5 = new User({id: '5'.repeat(24), count: 3});
                    const u6 = new User({id: '6'.repeat(24), count: 4});
                    const db = new MockDatabase([], [u1, u2, u3, u4, u5, u6]);
                    const service = new UserService(db as any);

                    const result = await service.list({count: {lt: 2}});
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
                    expect(result.total).to.be.eq(2);
                    expect(result.page).to.be.eq(1);
                    expect(result.limit).to.be.eq(10);
                    expect(result.pages).to.be.eq(1);
                    expect(result.offset).to.be.eq(0);
                    expect(result.docs).to.have.lengthOf(2);
                    expect(result.docs.map(d => d.id)).to.be.deep.eq([u1.id, u2.id]);
                });

                it('should return list of user entries with count less than or equal to 2', async () => {
                    const u1 = new User({id: '1'.repeat(24), count: 1});
                    const u2 = new User({id: '2'.repeat(24), count: 1});
                    const u3 = new User({id: '3'.repeat(24), count: 2});
                    const u4 = new User({id: '4'.repeat(24), count: 3});
                    const u5 = new User({id: '5'.repeat(24), count: 3});
                    const u6 = new User({id: '6'.repeat(24), count: 4});
                    const db = new MockDatabase([], [u1, u2, u3, u4, u5, u6]);
                    const service = new UserService(db as any);

                    const result = await service.list({count: {lte: 2}});
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
                    expect(result.total).to.be.eq(3);
                    expect(result.page).to.be.eq(1);
                    expect(result.limit).to.be.eq(10);
                    expect(result.pages).to.be.eq(1);
                    expect(result.offset).to.be.eq(0);
                    expect(result.docs).to.have.lengthOf(3);
                    expect(result.docs.map(d => d.id)).to.be.deep.eq([u1.id, u2.id, u3.id]);
                });

                it('should return list of user entries with count greater than or equal to 2', async () => {
                    const u1 = new User({id: '1'.repeat(24), count: 1});
                    const u2 = new User({id: '2'.repeat(24), count: 1});
                    const u3 = new User({id: '3'.repeat(24), count: 2});
                    const u4 = new User({id: '4'.repeat(24), count: 3});
                    const u5 = new User({id: '5'.repeat(24), count: 3});
                    const u6 = new User({id: '6'.repeat(24), count: 4});
                    const db = new MockDatabase([], [u1, u2, u3, u4, u5, u6]);
                    const service = new UserService(db as any);

                    const result = await service.list({count: {gte: 2}});
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
                    expect(result.total).to.be.eq(4);
                    expect(result.page).to.be.eq(1);
                    expect(result.limit).to.be.eq(10);
                    expect(result.pages).to.be.eq(1);
                    expect(result.offset).to.be.eq(0);
                    expect(result.docs).to.have.lengthOf(4);
                    expect(result.docs.map(d => d.id)).to.be.deep.eq([u3.id, u4.id, u5.id, u6.id]);
                });
            });
        });
    });
});
