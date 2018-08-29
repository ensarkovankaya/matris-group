import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { Group } from '../../../src/schemas/group.schema';
import { User } from '../../../src/schemas/user.schema';
import { GroupService } from '../../../src/services/group.service';
import { MockDatabase } from '../../mock/mock.database';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Services -> GroupService', () => {

    it('should initialize', () => {
        const service = new GroupService({} as any);
        expect(service).to.be.instanceof(GroupService);
        expect(service.toGroup).to.be.a('function');
        expect(service.get).to.be.a('function');
        expect(service.getUserGroups).to.be.a('function');
        expect(service.create).to.be.a('function');
        expect(service.delete).to.be.a('function');
        expect(service.undelete).to.be.a('function');
        expect(service.addUser).to.be.a('function');
        expect(service.removeUser).to.be.a('function');
        expect(service.normalize).to.be.a('function');
        expect(service.list).to.be.a('function');
    });

    it('should transform document to Group object', () => {
        const service = new GroupService({} as any);
        const obj = service.toGroup(new Group({name: 'Admins', slug: 'admins'}));
        expect(obj).to.be.an('object');
        expect(obj).to.have.keys([
            'id', 'name', 'slug', 'users', 'count', 'createdAt', 'updatedAt', 'deletedAt', 'deleted'
        ]);
    });

    describe('AddGroupToUser', () => {
        it('should create new user entry', async () => {
            const db = new MockDatabase();
            const service = new GroupService(db as any);

            await service.addGroupToUser('1'.repeat(24), '2'.repeat(24));

            const user = db.users[0];
            expect(user).to.instanceof(User);
            expect(user.count).to.be.eq(1);
            expect(user.groups).to.have.lengthOf(1);
            expect(user.groups).to.be.deep.eq(['2'.repeat(24)]);
        });

        it('should update existing user entry', async () => {
            const u = new User({user: '1'.repeat(24)});
            const db = new MockDatabase([], [u]);
            const service = new GroupService(db as any);

            await service.addGroupToUser('1'.repeat(24), '2'.repeat(24));

            const user = db.users[0];
            expect(user).to.be.instanceof(User);
            expect(user._id.toString()).to.be.eq(u._id.toString());
            expect(user.count).to.be.eq(1);
            expect(user.groups).to.have.lengthOf(1);
            expect(user.groups).to.be.deep.eq(['2'.repeat(24)]);
        });
    });

    describe('AddUserToGroup', () => {
        it('should update group', async () => {
            const g = new Group({name: 'Admins', slug: 'admins'});
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);

            await service.addUserToGroup('1'.repeat(24), g._id.toString());

            const group = db.groups[0];
            expect(group).to.be.instanceof(Group);
            expect(group._id.toString()).to.be.eq(g._id.toString());
            expect(group.count).to.be.eq(1);
            expect(group.users).to.have.lengthOf(1);
            expect(group.users).to.be.deep.eq(['1'.repeat(24)]);
        });

        it('should raise GroupNotFound', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.addUserToGroup('1'.repeat(24), '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupNotFound');
            }
        });
    });

    describe('RemoveUserFromGroup', () => {
        it('should remove user from group', async () => {
            const g = new Group({name: 'Admins', slug: 'admins', count: 1, users: ['1'.repeat(24)]});
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            await service.removeUserFromGroup('1'.repeat(24), g._id.toString());

            const group = db.groups[0];
            expect(group).to.be.instanceof(Group);
            expect(group._id.toString()).to.be.eq(g._id.toString());
            expect(group.count).to.be.eq(0);
            expect(group.users).to.have.lengthOf(0);
        });

        it('should raise GroupNotFound', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.removeUserFromGroup('1'.repeat(24), '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupNotFound');
            }
        });
    });

    describe('RemoveGroupFromUser', () => {
        it('should remove group from user entry', async () => {
            const u = new User({user: '1'.repeat(24), count: 1, groups: ['2'.repeat(24)]});
            const db = new MockDatabase([], [u]);
            const service = new GroupService(db as any);
            await service.removeGroupFromUser('1'.repeat(24), '2'.repeat(24));

            expect(db.users).to.have.lengthOf(1);
            const user = db.users[0];
            expect(user).to.be.instanceof(User);
            expect(user._id.toString()).to.be.eq(u._id.toString());
            expect(user.user).to.be.eq('1'.repeat(24));
            expect(user.count).to.be.eq(0);
            expect(user.groups).to.have.lengthOf(0);
        });
    });

    describe('Normalize', () => {
        it('should only except string values"', () => {
            try {
                const service = new GroupService({} as any);
                service.normalize(1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
            }
        });

        it('should transform value "Admins" to "admins"', () => {
            const service = new GroupService({} as any);
            const result = service.normalize('Admins');
            expect(result).to.be.eq('admins');
        });

        it('should transform value "2018 Students" to "2018-students"', () => {
            const service = new GroupService({} as any);
            const result = service.normalize('2018 Students');
            expect(result).to.be.eq('2018-students');
        });

        it('should transform value "  Admins  " to "admins"', () => {
            const service = new GroupService({} as any);
            const result = service.normalize('  Admins  ');
            expect(result).to.be.eq('admins');
        });
    });

    describe('Create', () => {
        it('should create group', async () => {
            const db = new MockDatabase();
            const service = new GroupService(db as any);

            const group = await service.create('Admins');
            expect(group).to.be.an('object');
            expect(group).to.have.keys([
                'id', 'name', 'slug', 'users', 'count', 'createdAt', 'updatedAt', 'deletedAt', 'deleted'
            ]);
            expect(group.name).to.be.eq('Admins');
            expect(group.slug).to.be.eq('admins');
            expect(group.users).to.be.deep.eq([]);
            expect(group.count).to.be.deep.eq(0);
            expect(group.createdAt).to.be.a('date');
            expect(group.updatedAt).to.be.a('date');
            expect(group.deletedAt).to.be.eq(null);
            expect(group.deleted).to.be.eq(false);
        });

        it('should raise ArgumentError for invalid name', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.create(1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
            }
        });
    });

    describe('Update', () => {
        it('should update group', async () => {
            const group = new Group({name: 'Admins', slug: 'admins'});
            const db = new MockDatabase([group]);
            const service = new GroupService(db as any);
            await service.update(group._id.toString(), 'Managers');

            const updated = db.groups[0];

            expect(updated).to.be.instanceof(Group);
            expect(updated._id.toString()).to.be.eq(group._id.toString());
            expect(updated.name).to.be.eq('Managers');
            expect(updated.slug).to.be.eq('managers');
            expect(updated.updatedAt).to.be.gt(group.updatedAt);
            expect(updated.createdAt).to.be.eq(group.createdAt);
        });

        it('should raise ArgumentError for invalid empty name', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.update('1'.repeat(24), '');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
            }
        });

        it('should raise ArgumentError for not string value for name', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.update('1'.repeat(24), 1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
            }
        });

        it('should raise ArgumentError for not string value for groupId', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.update(1 as any, 'Admins');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
            }
        });

        it('should raise ArgumentError for short groupId', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.update('1'.repeat(23), 'Admins');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
            }
        });

        it('should raise GroupNotFound', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.update('1'.repeat(24), 'Admins');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupNotFound');
            }
        });
    });

    describe('Delete', () => {
        it('should mark group as deleted', async () => {
            const g = new Group({name: 'Admins', slug: 'admins', count: 2, users: ['1'.repeat(24), '2'.repeat(24)]});
            const u1 = new User({user: '1'.repeat(24), count: 1, groups: [g._id.toString()]});
            const u2 = new User({user: '2'.repeat(24), count: 1, groups: [g._id.toString()]});
            const db = new MockDatabase([g], [u1, u2]);
            const service = new GroupService(db as any);

            await service.delete(g._id.toString());

            expect(db.groups).to.have.lengthOf(1);
            expect(db.users).to.have.lengthOf(2);
            const user1 = db.users[0];
            const user2 = db.users[1];
            const group = db.groups[0];

            expect(group).to.be.instanceof(Group);
            expect(group._id.toString()).to.be.eq(g._id.toString());
            expect(group.deleted).to.be.eq(true);
            expect(group.deletedAt).to.be.a('date');
            expect(group.count).to.be.eq(2);
            expect(group.users).to.be.deep.eq([u1.user, u2.user]);

            expect(user1.count).to.be.eq(0);
            expect(user1.groups).to.be.deep.eq([]);

            expect(user2.count).to.be.eq(0);
            expect(user2.groups).to.be.deep.eq([]);
        });

        it('should raise ArgumentError for not string value for id', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.delete(1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
            }
        });

        it('should raise ArgumentError for short id', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.delete('1'.repeat(23));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
            }
        });

        it('should raise GroupNotFound', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.delete('1'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupNotFound');
            }
        });
    });

    describe('Undelete', () => {
        it('should reverse deleted group', async () => {
            const g = new Group({
                name: 'Admins',
                slug: 'admins',
                deleted: true,
                deletedAt: new Date(),
                count: 1,
                users: ['1'.repeat(24)]
            });
            const u = new User({user: '1'.repeat(24)});
            const db = new MockDatabase([g], [u]);
            const service = new GroupService(db as any);
            await service.undelete(g._id.toString());

            expect(db.groups).to.have.lengthOf(1);
            expect(db.users).to.have.lengthOf(1);
            const group = db.groups[0];
            const user = db.users[0];
            expect(group).to.be.instanceof(Group);
            expect(user).to.be.instanceof(User);

            expect(group._id.toString()).to.be.eq(g._id.toString());
            expect(group.deleted).to.be.eq(false);
            expect(group.deletedAt).to.be.eq(null);
            expect(group.users).to.have.lengthOf(1);
            expect(group.users).to.be.deep.eq(['1'.repeat(24)]);

            expect(user.count).to.be.eq(1);
            expect(user.groups).to.be.deep.eq([group._id.toString()]);
        });

        it('should throw GroupNotFound for not existing group', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.undelete('1'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupNotFound');
            }
        });

        it('should throw GroupNotFound for not deleted group', async () => {
            try {
                const g = new Group({name: 'Admins', slug: 'admins'});
                const db = new MockDatabase([g]);
                const service = new GroupService(db as any);
                await service.undelete('1'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupNotFound');
            }
        });
    });

    describe('Get', () => {
        it('should raise InvalidArgument if argument not object', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get(1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by');
            }
        });

        it('should raise InvalidArgument if by.id not string', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({id: 1} as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.id');
            }
        });

        it('should raise InvalidArgument if by.name not string', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({name: 1} as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.name');
            }
        });

        it('should raise InvalidArgument if by.slug not string', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({slug: 1} as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.slug');
            }
        });

        it('should get group by id', async () => {
            const g = new Group({name: 'Admins', slug: 'admins'});
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);

            const group = await service.get({id: g._id.toString()});
            expect(group).to.be.an('object');
            expect(group).to.have.keys(
                ['id', 'name', 'slug', 'count', 'users', 'createdAt', 'updatedAt', 'deletedAt', 'deleted']
            );
            expect(group.id).to.be.eq(g._id.toString());
            expect(group.name).to.be.eq(g.name);
            expect(group.slug).to.be.eq(g.slug);
            expect(group.count).to.be.eq(g.count);
            expect(group.users).to.be.deep.eq(g.users);
            expect(group.createdAt).to.be.eq(g.createdAt);
            expect(group.updatedAt).to.be.eq(g.updatedAt);
            expect(group.deletedAt).to.be.eq(g.deletedAt);
            expect(group.deleted).to.be.eq(g.deleted);
        });

        it('should get group by name', async () => {
            const g = new Group({name: 'Admins', slug: 'admins'});
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);

            const group = await service.get({name: 'Admins'});
            expect(group).to.be.an('object');
            expect(group).to.have.keys(
                ['id', 'name', 'slug', 'count', 'users', 'createdAt', 'updatedAt', 'deletedAt', 'deleted']
            );
            expect(group.id).to.be.eq(g._id.toString());
            expect(group.name).to.be.eq(g.name);
            expect(group.slug).to.be.eq(g.slug);
            expect(group.count).to.be.eq(g.count);
            expect(group.users).to.be.deep.eq(g.users);
            expect(group.createdAt).to.be.eq(g.createdAt);
            expect(group.updatedAt).to.be.eq(g.updatedAt);
            expect(group.deletedAt).to.be.eq(g.deletedAt);
            expect(group.deleted).to.be.eq(g.deleted);
        });

        it('should get group by slug', async () => {
            const g = new Group({name: 'Admins', slug: 'admins'});
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);

            const group = await service.get({slug: 'admins'});
            expect(group).to.be.an('object');
            expect(group).to.have.keys(
                ['id', 'name', 'slug', 'count', 'users', 'createdAt', 'updatedAt', 'deletedAt', 'deleted']
            );
            expect(group.id).to.be.eq(g._id.toString());
            expect(group.name).to.be.eq(g.name);
            expect(group.slug).to.be.eq(g.slug);
            expect(group.count).to.be.eq(g.count);
            expect(group.users).to.be.deep.eq(g.users);
            expect(group.createdAt).to.be.eq(g.createdAt);
            expect(group.updatedAt).to.be.eq(g.updatedAt);
            expect(group.deletedAt).to.be.eq(g.deletedAt);
            expect(group.deleted).to.be.eq(g.deleted);
        });

        it('should return null for not existing group', async () => {
            const db = new MockDatabase();
            const service = new GroupService(db as any);

            const result = await service.get({slug: 'admins'});
            expect(result).to.be.eq(null);
        });

        it('should return null for deleted group', async () => {
            const g = new Group({name: 'Admins', slug: 'admins', deleted: true, deletedAt: new Date()});
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);

            const result = await service.get({id: g._id.toString()});
            expect(result).to.be.eq(null);
        });

        it('should return group if deleted argument is true', async () => {
            const g = new Group({name: 'Admins', slug: 'admins', deleted: true, deletedAt: new Date()});
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);

            const group = await service.get({id: g._id.toString()}, true);
            expect(group).to.be.an('object');
            expect(group.id).to.be.eq(g._id.toString());
        });
    });

    describe('AddUser', () => {
        it('should add user to group and create User entry', async () => {
            const g = new Group({name: 'Admins', slug: 'admins'});
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            await service.addUser('1'.repeat(24), g._id.toString());

            expect(db.groups).to.have.lengthOf(1);

            const group = db.groups[0];
            expect(group).to.be.instanceof(Group);
            expect(group.count).to.be.eq(1);
            expect(group.users).to.be.deep.eq(['1'.repeat(24)]);

            expect(db.users).to.have.lengthOf(1);
            const user = db.users[0];
            expect(user).to.be.instanceof(User);
            expect(user.user).to.be.eq('1'.repeat(24));
            expect(user.groups).to.have.lengthOf(1);
            expect(user.groups).to.be.deep.eq([g._id.toString()]);
        });

        it('should add user to group and update existing User entry', async () => {
            const g = new Group({name: 'Admins', slug: 'admins'});
            const u = new User({user: '1'.repeat(24)});
            const db = new MockDatabase([g], [u]);
            const service = new GroupService(db as any);
            await service.addUser('1'.repeat(24), g._id.toString());

            expect(db.groups).to.have.lengthOf(1);

            const group = db.groups[0];
            expect(group).to.be.instanceof(Group);
            expect(group.count).to.be.eq(1);
            expect(group.users).to.be.deep.eq(['1'.repeat(24)]);

            expect(db.users).to.have.lengthOf(1);
            const user = db.users[0];
            expect(user).to.be.instanceof(User);
            expect(user.user).to.be.eq('1'.repeat(24));
            expect(user.groups).to.have.lengthOf(1);
            expect(user.groups).to.be.deep.eq([g._id.toString()]);
            expect(user.updatedAt).to.be.gt(u.updatedAt);
        });

        it('should raise InvalidArgument if userId not string', async () => {
            try {
                const service = new GroupService({} as any);
                await service.addUser(1 as any, '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('userId');
            }
        });

        it('should raise InvalidArgument if userId length not equal to 24', async () => {
            try {
                const service = new GroupService({} as any);
                await service.addUser('1'.repeat(23), '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('userId');
            }

            try {
                const service = new GroupService({} as any);
                await service.addUser('1'.repeat(25), '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('userId');
            }
        });

        it('should raise InvalidArgument if groupId not string', async () => {
            try {
                const service = new GroupService({} as any);
                await service.addUser('1'.repeat(24), 1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('groupId');
            }
        });

        it('should raise InvalidArgument if groupId length not equal to 24', async () => {
            try {
                const service = new GroupService({} as any);
                await service.addUser('1'.repeat(24), '2'.repeat(23));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('groupId');
            }

            try {
                const service = new GroupService({} as any);
                await service.addUser('1'.repeat(24), '2'.repeat(25));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('groupId');
            }
        });
    });

    describe('RemoveUser', () => {
        it('should raise InvalidArgument if userId not string', async () => {
            try {
                const service = new GroupService({} as any);
                await service.removeUser(1 as any, '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('userId');
            }
        });

        it('should raise InvalidArgument if userId length not equal to 24', async () => {
            try {
                const service = new GroupService({} as any);
                await service.removeUser('1'.repeat(23), '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('userId');
            }

            try {
                const service = new GroupService({} as any);
                await service.removeUser('1'.repeat(25), '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('userId');
            }
        });

        it('should raise InvalidArgument if groupId not string', async () => {
            try {
                const service = new GroupService({} as any);
                await service.removeUser('1'.repeat(24), 1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('groupId');
            }
        });

        it('should raise InvalidArgument if groupId length not equal to 24', async () => {
            try {
                const service = new GroupService({} as any);
                await service.removeUser('1'.repeat(24), '2'.repeat(23));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('groupId');
            }

            try {
                const service = new GroupService({} as any);
                await service.removeUser('1'.repeat(24), '2'.repeat(25));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('groupId');
            }
        });

        it('should remove user from group and update user entry', async () => {
            const g = new Group({name: 'Admins', slug: 'admins', count: 1, users: ['1'.repeat(24)]});
            const u = new User({user: '1'.repeat(24), count: 2, groups: [
                g._id.toString(),
                '2'.repeat(24)
            ]});
            const db = new MockDatabase([g], [u]);
            const service = new GroupService(db as any);
            await service.removeUser('1'.repeat(24), g._id.toString());

            expect(db.groups).to.have.lengthOf(1);

            const group = db.groups[0];
            expect(group).to.be.instanceof(Group);
            expect(group.count).to.be.eq(0);
            expect(group.users).to.be.deep.eq([]);
            expect(group.updatedAt).to.be.gt(g.updatedAt);

            expect(db.users).to.have.lengthOf(1);
            const user = db.users[0];
            expect(user).to.be.instanceof(User);
            expect(user.user).to.be.eq('1'.repeat(24));
            expect(user.groups).to.have.lengthOf(1);
            expect(user.groups).to.be.deep.eq(['2'.repeat(24)]);
            expect(user.updatedAt).to.be.gt(u.updatedAt);
        });
    });

    describe('Paginate', () => {
        it('should paginate with limit 10', () => {
            const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            const service = new GroupService({} as any);
            const result = service.paginate(data, {limit: 10});
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
            expect(result.total).to.be.eq(15);
            expect(result.page).to.be.eq(1);
            expect(result.pages).to.be.eq(2);
            expect(result.offset).to.be.eq(0);
            expect(result.docs).to.have.lengthOf(10);
            expect(result.docs).to.deep.eq([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
        it('should return page 2', () => {
            const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            const service = new GroupService({} as any);
            const result = service.paginate(data, {limit: 10, page: 2});
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
            expect(result.total).to.be.eq(15);
            expect(result.page).to.be.eq(2);
            expect(result.pages).to.be.eq(2);
            expect(result.offset).to.be.eq(0);
            expect(result.docs).to.have.lengthOf(5);
            expect(result.docs).to.deep.eq([11, 12, 13, 14, 15]);
        });
        it('should offset', () => {
            const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            const service = new GroupService({} as any);
            const result = service.paginate(data, {limit: 10, offset: 2});
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
            expect(result.total).to.be.eq(13);
            expect(result.page).to.be.eq(1);
            expect(result.pages).to.be.eq(2);
            expect(result.offset).to.be.eq(2);
            expect(result.docs).to.have.lengthOf(10);
            expect(result.docs).to.deep.eq([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        });
        it('should raise PaginationError', () => {
            try {
                const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
                const service = new GroupService({} as any);
                service.paginate(data, {limit: 10, page: 5});
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('PaginationError');
            }
        });
    });

    describe('GetUserGroups', () => {
        it('should return user groups', async () => {
            const g1 = new Group({name: 'G1', slug: 'g1', count: 1, users: ['1'.repeat(24)]});
            const g2 = new Group({name: 'G2', slug: 'g2', count: 2, users: ['1'.repeat(24), '2'.repeat(24)]});
            const g3 = new Group({name: 'G3', slug: 'g3'});
            const u = new User({user: '1'.repeat(24), count: 2, groups: [g1._id.toString(), g2._id.toString()]});
            const db = new MockDatabase([g1, g2, g3], [u]);
            const service = new GroupService(db as any);

            const result = await service.getUserGroups('1'.repeat(24));
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
            expect(result.total).to.be.eq(2);
            expect(result.page).to.be.eq(1);
            expect(result.pages).to.be.eq(1);
            expect(result.offset).to.be.eq(0);
            expect(result.docs).to.have.lengthOf(2);
            expect(result.docs.map(d => d.id)).to.deep.eq([g1._id.toString(), g2._id.toString()]);
        });

        it('should return no groups for not existing user', async () => {
            const g1 = new Group({name: 'G1', slug: 'g1', count: 1, users: ['3'.repeat(24)]});
            const g2 = new Group({name: 'G2', slug: 'g2', count: 2, users: ['2'.repeat(24), '3'.repeat(24)]});
            const g3 = new Group({name: 'G3', slug: 'g3'});
            const db = new MockDatabase([g1, g2, g3]);
            const service = new GroupService(db as any);
            const result = await service.getUserGroups('1'.repeat(24));

            expect(result).to.be.an('object');
            expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
            expect(result.total).to.be.eq(0);
            expect(result.page).to.be.eq(1);
            expect(result.pages).to.be.eq(1);
            expect(result.offset).to.be.eq(0);
            expect(result.docs).to.have.lengthOf(0);
        });
    });

    describe('List', () => {
        it('should return list of groups', async () => {
            const g1 = new Group({name: 'G1', slug: 'g1'});
            const g2 = new Group({name: 'G2', slug: 'g2'});
            const g3 = new Group({name: 'G3', slug: 'g3'});
            const db = new MockDatabase([g1, g2, g3]);
            const service = new GroupService(db as any);

            const result = await service.list();

            expect(result).to.be.an('object');
            expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
            expect(result.total).to.be.eq(3);
            expect(result.page).to.be.eq(1);
            expect(result.pages).to.be.eq(1);
            expect(result.offset).to.be.eq(0);
            expect(result.docs).to.have.lengthOf(3);
            expect(result.docs.map(d => d.id)).to.deep.eq([
                g1._id.toString(),
                g2._id.toString(),
                g3._id.toString()
            ]);
        });

        it('should return list of groups with filter name', async () => {
            const g1 = new Group({name: 'G1', slug: 'g1'});
            const g2 = new Group({name: 'G2', slug: 'g2'});
            const g3 = new Group({name: 'G3', slug: 'g3'});
            const db = new MockDatabase([g1, g2, g3]);
            const service = new GroupService(db as any);

            const result = await service.list({name: 'G1'});

            expect(result).to.be.an('object');
            expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
            expect(result.total).to.be.eq(1);
            expect(result.page).to.be.eq(1);
            expect(result.pages).to.be.eq(1);
            expect(result.offset).to.be.eq(0);
            expect(result.docs).to.have.lengthOf(1);
            expect(result.docs.map(d => d.id)).to.deep.eq([g1._id.toString()]);
        });

        it('should return list of groups with filter createdAt', async () => {
            const g1 = new Group({name: 'G1', slug: 'g1', createdAt: new Date(2017, 0, 12)});
            const g2 = new Group({name: 'G2', slug: 'g2', createdAt: new Date(2017, 2, 12)});
            const g3 = new Group({name: 'G3', slug: 'g3', createdAt: new Date(2017, 3, 12)});
            const db = new MockDatabase([g1, g2, g3]);
            const service = new GroupService(db as any);

            const result = await service.list({createdAt: {gt: g2.createdAt}});

            expect(result).to.be.an('object');
            expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
            expect(result.total).to.be.eq(1);
            expect(result.page).to.be.eq(1);
            expect(result.pages).to.be.eq(1);
            expect(result.offset).to.be.eq(0);
            expect(result.docs).to.have.lengthOf(1);
            expect(result.docs.map(d => d.id)).to.deep.eq([g3._id.toString()]);
        });
    });
});
