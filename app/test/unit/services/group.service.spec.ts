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

        // Static Methods
        expect(GroupService.toGroup).to.be.a('function');
        expect(GroupService.normalize).to.be.a('function');

        const service = new GroupService({} as any);
        expect(service).to.be.instanceof(GroupService);
        expect(service.get).to.be.a('function');
        expect(service.create).to.be.a('function');
        expect(service.delete).to.be.a('function');
        expect(service.add).to.be.a('function');
        expect(service.remove).to.be.a('function');
        expect(service.list).to.be.a('function');
    });

    describe('ToGroup', () => {
        it('should transform document to Group object', () => {
            const group = new Group({ name: 'Admins', slug: 'admins' });
            const obj = GroupService.toGroup(group);
            expect(obj).to.be.an('object');
            expect(obj).to.have.keys([
                'id', 'name', 'slug', 'users', 'count', 'createdAt', 'updatedAt', 'deletedAt', 'deleted'
            ]);
            expect(obj.id).to.be.eq(group._id.toString());
            expect(obj.name).to.be.eq(group.name);
            expect(obj.slug).to.be.eq(group.slug);
            expect(obj.users).to.be.deep.eq(group.users);
            expect(obj.count).to.be.eq(group.count);
            expect(obj.createdAt).to.be.eq(group.createdAt);
            expect(obj.updatedAt).to.be.eq(group.updatedAt);
            expect(obj.deletedAt).to.be.eq(group.deletedAt);
            expect(obj.deleted).to.be.eq(group.deleted);
        });

        it('should raise InvalidDocument for non Group instance', () => {
            try {
                GroupService.toGroup({
                    _id: '123',
                    name: 'Admins',
                    slug: 'admins',
                    users: [],
                    count: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                    deleted: false
                } as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidDocument');
            }
        });
    });

    describe('Normalize', () => {
        it('should only except string values"', () => {
            try {
                GroupService.normalize(1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
            }
        });

        it('should transform value "Admins" to "admins"', () => {
            const result = GroupService.normalize('Admins');
            expect(result).to.be.eq('admins');
        });

        it('should transform value "Öğretmenler" to "ogretmenler"', () => {
            const result = GroupService.normalize('Öğretmenler');
            expect(result).to.be.eq('ogretmenler');
        });

        it('should transform value "Öğrenciler" to "ogrenciler"', () => {
            const result = GroupService.normalize('Öğrenciler');
            expect(result).to.be.eq('ogrenciler');
        });

        it('should transform value "Yöneticiler" to "yoneticiler"', () => {
            const result = GroupService.normalize('Yöneticiler');
            expect(result).to.be.eq('yoneticiler');
        });

        it('should transform value "2018 Students" to "2018-students"', () => {
            const result = GroupService.normalize('2018 Students');
            expect(result).to.be.eq('2018-students');
        });

        it('should transform value "  Admins  " to "admins"', () => {
            const result = GroupService.normalize('  Admins  ');
            expect(result).to.be.eq('admins');
        });
    });

    describe('Create', () => {
        it('should raise ArgumentError for invalid name', async () => {
            try {
                const service = new GroupService({} as any);
                await service.create(1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('name');
            }
        });

        it('should raise ArgumentError for short name', async () => {
            try {
                const service = new GroupService({} as any);
                await service.create("");
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('name');
            }
        });

        it('should raise ArgumentError for long name', async () => {
            try {
                const service = new GroupService({} as any);
                await service.create("a".repeat(33));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('name');
            }
        });

        it('should raise GroupExists if another group exists with same name', async () => {
            try {
                const db = new MockDatabase([new Group({ name: 'Admins', slug: 'admins' })]);
                const service = new GroupService(db as any);
                await service.create('Admins');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupExists');
            }
        });

        it('should create group if group not exists', async () => {
            const db = new MockDatabase();
            const service = new GroupService(db as any);

            const group = await service.create('Admins');

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            slug: 'admins',
                            deleted: false
                        }
                    }
                },
                {
                    method: 'createGroup',
                    arguments: {
                        0: {
                            name: 'Admins',
                            slug: 'admins'
                        }
                    }
                }
            ]);

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
    });

    describe('Update', () => {
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

        it('should raise GroupExists', async () => {
            try {
                const g1 = new Group({ name: 'Admins', slug: 'admins' });
                const g2 = new Group({ name: 'Managers', slug: 'managers' });
                const db = new MockDatabase([g1, g2]);
                const service = new GroupService(db as any);
                await service.update(g2._id.toString(), 'Admins');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupExists');
            }
        });

        it('should update group', async () => {
            const group = new Group({ name: 'Admins', slug: 'admins' });
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

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            _id: group._id.toString(),
                            deleted: false
                        }
                    }
                },
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            slug: 'managers',
                            deleted: false
                        }
                    }
                },
                {
                    method: 'updateGroup',
                    arguments: {
                        0: group._id.toString(),
                        1: {
                            name: 'Managers',
                            slug: 'managers'
                        }
                    }
                }
            ]);
        });

        it('should not perform db update if group name same with update name', async () => {
            const group = new Group({ name: 'Admins', slug: 'admins' });
            const db = new MockDatabase([group]);
            const service = new GroupService(db as any);
            await service.update(group._id.toString(), 'Admins');

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            _id: group._id.toString(),
                            deleted: false
                        }
                    }
                }
            ]);
        });
    });

    describe('Delete', () => {
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

        it('should mark group as deleted', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins', count: 2, users: ['1'.repeat(24), '2'.repeat(24)] });
            const db = new MockDatabase([g], []);
            const service = new GroupService(db as any);

            await service.delete(g._id.toString());

            expect(db.groups).to.have.lengthOf(1);
            const group = db.groups[0];

            expect(group).to.be.instanceof(Group);
            expect(group._id.toString()).to.be.eq(g._id.toString());
            expect(group.deleted).to.be.eq(true);
            expect(group.deletedAt).to.be.a('date');
            expect(group.count).to.be.eq(2);
            expect(group.users).to.be.deep.eq([
                '1'.repeat(24),
                '2'.repeat(24)
            ]);

            expect(db.stack).to.have.lengthOf(2);

            const s1 = db.stack[0];
            expect(s1).to.be.deep.eq({
                method: 'findOneGroupBy',
                arguments: {
                    0: {
                        _id: g._id.toString(),
                        deleted: false
                    }
                }
            });

            const s2 = db.stack[1];
            expect(s2.method).to.be.eq('updateGroup');
            expect(s2.arguments).to.be.an('object');
            expect(s2.arguments).to.have.keys(['0', '1']);
            expect(s2.arguments['0']).to.be.eq(g._id.toString());
            expect(s2.arguments['1']).to.be.an('object');
            expect(s2.arguments['1']).to.have.keys(['deleted', 'deletedAt']);
            expect(s2.arguments['1'].deleted).to.be.eq(true);
            expect(s2.arguments['1'].deletedAt).to.be.a('date');
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
                await service.get({ id: 1 } as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.id');
            }
        });

        it('should raise InvalidArgument if by.id length smaller 24', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({ id: "1".repeat(23) } as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.id');
            }
        });

        it('should raise InvalidArgument if by.id length bigger 24', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({ id: "1".repeat(25) } as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.id');
            }
        });

        it('should raise InvalidArgument if by.name not string', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({ name: 1 } as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.name');
            }
        });

        it('should raise InvalidArgument if by.name length smaller than 1', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({ name: "" });
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.name');
            }
        });

        it('should raise InvalidArgument if by.name length bigger than 35', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({ name: "a".repeat(36) });
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.name');
            }
        });

        it('should raise InvalidArgument if by.slug not string', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({ slug: 1 } as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.slug');
            }
        });

        it('should raise InvalidArgument if by.slug not normalized', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({ slug: "Admins" });
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.slug');
            }
        });

        it('should raise InvalidArgument if by.slug length smaller than 1', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({ slug: "" });
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.slug');
            }
        });

        it('should raise InvalidArgument if by.slug length bigger than 35', async () => {
            try {
                const service = new GroupService({} as any);
                await service.get({ slug: "a".repeat(36) });
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by.slug');
            }
        });

        it('should get group by id', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins' });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);

            const group = await service.get({ id: g._id.toString() });
            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            _id: g._id.toString(),
                            deleted: false
                        }
                    }
                }
            ]);

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
            const g = new Group({ name: 'Admins', slug: 'admins' });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);

            const group = await service.get({ name: 'Admins' });

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            name: 'Admins',
                            deleted: false
                        }
                    }
                }
            ]);

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
            const g = new Group({ name: 'Admins', slug: 'admins' });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);

            const group = await service.get({ slug: 'admins' });

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            slug: 'admins',
                            deleted: false
                        }
                    }
                }
            ]);

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

        it('should return null for not existing group requested by id', async () => {
            const db = new MockDatabase();
            const service = new GroupService(db as any);
            const result = await service.get({ id: '1'.repeat(24) });

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            _id: '1'.repeat(24),
                            deleted: false
                        }
                    }
                }
            ]);

            expect(result).to.be.eq(null);
        });

        it('should return null for not existing group requested by name', async () => {
            const db = new MockDatabase();
            const service = new GroupService(db as any);
            const result = await service.get({ name: 'Admins' });

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            name: 'Admins',
                            deleted: false
                        }
                    }
                }
            ]);

            expect(result).to.be.eq(null);
        });

        it('should return null for not existing group requested by slug', async () => {
            const db = new MockDatabase();
            const service = new GroupService(db as any);
            const result = await service.get({ slug: 'admins' });

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            slug: 'admins',
                            deleted: false
                        }
                    }
                }
            ]);

            expect(result).to.be.eq(null);
        });

        it('should return null for deleted group requested by id', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins', deleted: true, deletedAt: new Date() });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            const result = await service.get({ id: g._id.toString() });

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            _id: g._id.toString(),
                            deleted: false
                        }
                    }
                }
            ]);

            expect(result).to.be.eq(null);
        });

        it('should return null for deleted group requested by name', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins', deleted: true, deletedAt: new Date() });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            const result = await service.get({ name: 'Admins' });

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            name: 'Admins',
                            deleted: false
                        }
                    }
                }
            ]);

            expect(result).to.be.eq(null);
        });

        it('should return null for deleted group requested by slug', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins', deleted: true, deletedAt: new Date() });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            const result = await service.get({ slug: 'admins' });

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            slug: 'admins',
                            deleted: false
                        }
                    }
                }
            ]);

            expect(result).to.be.eq(null);
        });

        it('should return deleted group by id if argument "deleted" is true', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins', deleted: true, deletedAt: new Date() });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            const group = await service.get({ id: g._id.toString() }, true);

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            _id: g._id.toString(),
                            deleted: true
                        }
                    }
                }
            ]);

            expect(group).to.be.an('object');
            expect(group.id).to.be.eq(g._id.toString());
        });

        it('should return deleted group by name if argument "deleted" is true', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins', deleted: true, deletedAt: new Date() });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            const group = await service.get({ name: 'Admins' }, true);

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            name: 'Admins',
                            deleted: true
                        }
                    }
                }
            ]);

            expect(group).to.be.an('object');
            expect(group.id).to.be.eq(g._id.toString());
        });

        it('should return deleted group by slug if argument "deleted" is true', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins', deleted: true, deletedAt: new Date() });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            const group = await service.get({ slug: 'admins' }, true);

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            slug: 'admins',
                            deleted: true
                        }
                    }
                }
            ]);

            expect(group).to.be.an('object');
            expect(group.id).to.be.eq(g._id.toString());
        });
    });

    describe('List', () => {
        it('should return list of groups', async () => {
            const g1 = new Group({ name: 'G1', slug: 'g1' });
            const g2 = new Group({ name: 'G2', slug: 'g2' });
            const g3 = new Group({ name: 'G3', slug: 'g3' });
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
            const g1 = new Group({ name: 'G1', slug: 'g1' });
            const g2 = new Group({ name: 'G2', slug: 'g2' });
            const g3 = new Group({ name: 'G3', slug: 'g3' });
            const db = new MockDatabase([g1, g2, g3]);
            const service = new GroupService(db as any);

            const result = await service.list({ name: 'G1' });

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
            const g1 = new Group({ name: 'G1', slug: 'g1', createdAt: new Date(2017, 0, 12) });
            const g2 = new Group({ name: 'G2', slug: 'g2', createdAt: new Date(2017, 2, 12) });
            const g3 = new Group({ name: 'G3', slug: 'g3', createdAt: new Date(2017, 3, 12) });
            const db = new MockDatabase([g1, g2, g3]);
            const service = new GroupService(db as any);

            const result = await service.list({ createdAt: { gt: g2.createdAt } });

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

    describe('Add', () => {
        it('should raise GroupNotFound', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.add('1'.repeat(24), '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupNotFound');
            }
        });

        it('should call updateGroup from database', async () => {

            const g = new Group({ name: 'Admins', slug: 'admins' });

            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            await service.add('1'.repeat(24), g._id.toString());
            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            _id: g._id.toString(),
                            deleted: false
                        }
                    }
                },
                {
                    method: 'updateGroup',
                    arguments: {
                        id: g._id.toString(),
                        data: {
                            0: ['1'.repeat(24)],
                            1: 1
                        }
                    }
                }
            ]);
        });
    });

    describe('RemoveUser', () => {
        it('should raise InvalidArgument if userId not string', async () => {
            try {
                const service = new GroupService({} as any);
                await service.remove(1 as any, '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('userId');
            }
        });

        it('should raise InvalidArgument if userId length shorter than 24', async () => {
            try {
                const service = new GroupService({} as any);
                await service.remove('1'.repeat(23), '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('userId');
            }
        });

        it('should raise InvalidArgument if userId length longer than 24', async () => {
            try {
                const service = new GroupService({} as any);
                await service.remove('1'.repeat(25), '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('userId');
            }
        });

        it('should raise InvalidArgument if groupId not string', async () => {
            try {
                const service = new GroupService({} as any);
                await service.remove('1'.repeat(24), 1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('groupId');
            }
        });

        it('should raise InvalidArgument if groupId length shorter 24', async () => {
            try {
                const service = new GroupService({} as any);
                await service.remove('1'.repeat(24), '2'.repeat(23));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('groupId');
            }
        });

        it('should raise InvalidArgument if groupId length longer 24', async () => {
            try {
                const service = new GroupService({} as any);
                await service.remove('1'.repeat(24), '2'.repeat(25));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('groupId');
            }
        });

        it('should raise GroupNotFound if group not exists', async () => {
            try {
                const db = new MockDatabase();
                const service = new GroupService(db as any);
                await service.remove('1'.repeat(24), '2'.repeat(24));
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupNotFound');
            }
        });

        it('should raise GroupNotFound if group is deleted', async () => {
            try {
                const group = new Group({name: 'Admins', slug: 'admins', deleted: true, deletedAt: new Date()});
                const db = new MockDatabase([group]);
                const service = new GroupService(db as any);
                await service.remove('1'.repeat(24), group._id.toString());
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupNotFound');
            }
        });

        it('should remove user from group and update group', async () => {
            const g = new Group({name: 'Admins', slug: 'admins', count: 1, users: ['1'.repeat(24)]});
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            await service.remove('1'.repeat(24), g._id.toString());

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            _id: g._id.toString(),
                            deleted: false
                        }
                    }
                },
                {
                    method: 'updateGroup',
                    arguments: {
                        0: {
                            users: [],
                            count: 0
                        }
                    }
                }
            ]);
            expect(db.groups).to.have.lengthOf(1);

            const group = db.groups[0];
            expect(group).to.be.instanceof(Group);
            expect(group.count).to.be.eq(0);
            expect(group.users).to.be.deep.eq([]);
            expect(group.updatedAt).to.be.gt(g.updatedAt);
        });

        it('should not perform update if user not in group', async () => {
            const g = new Group({name: 'Admins', slug: 'admins', count: 1, users: ['2'.repeat(24)]});
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            await service.remove('1'.repeat(24), g._id.toString());

            expect(db.stack).to.be.deep.eq([
                {
                    method: 'findOneGroupBy',
                    arguments: {
                        0: {
                            _id: g._id.toString(),
                            deleted: false
                        }
                    }
                }
            ]);
            expect(db.groups).to.have.lengthOf(1);

            const group = db.groups[0];
            expect(group).to.be.instanceof(Group);
            expect(group.count).to.be.eq(g.count);
            expect(group.users).to.be.deep.eq(g.users);
            expect(group.updatedAt).to.be.eq(g.updatedAt);
        });
    });
});
