import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { CreateGroupInput } from '../../../../src/graphql/inputs/create.group.input';
import { DeleteGroupInput } from '../../../../src/graphql/inputs/delete.group.input';
import { GetGroupInput } from '../../../../src/graphql/inputs/get.group.input';
import { GroupFilterInput } from '../../../../src/graphql/inputs/group.filter.input';
import { PaginationInput } from '../../../../src/graphql/inputs/pagination.input';
import { UpdateGroupInput } from '../../../../src/graphql/inputs/update.group.input';
import { GroupResolver } from '../../../../src/graphql/resolvers/group.resolver';
import { Group } from '../../../../src/schemas/group.schema';
import { GroupService } from '../../../../src/services/group.service';
import { MockDatabase } from '../../../mock/mock.database';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

class MethodCalled extends Error {
    public name = 'MethodCalled';

    constructor(public method: string, message?: string) {
        super(message);
    }
}

describe('Unit -> Grapql -> Resolvers -> GroupResolver', () => {
    describe('ListGroups', () => {
        it('should raise InvalidArgument if filters is not instance of GroupFilterInput', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                await resolver.listGroups({} as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('filters');
            }
        });

        it('should raise InvalidArgument if pagination is not instance of PaginationInput', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                await resolver.listGroups(new GroupFilterInput(), {} as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('pagination');
            }
        });

        it('should call validate method from filters', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                const filters = new GroupFilterInput();
                filters.validate = async () => { throw new MethodCalled('validate'); };
                await resolver.listGroups(filters);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
            }
        });

        it('should call validate method from pagination', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                const pagination = new PaginationInput();
                pagination.validate = () => { throw new MethodCalled('validate'); };
                await resolver.listGroups(new GroupFilterInput(), pagination);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
            }
        });

        it('should call list method from GroupService', async () => {
            class MockGroupService {

                public filters: GroupFilterInput;
                public pagination: PaginationInput;

                public list(filters, pagination) {
                    this.filters = filters;
                    this.pagination = pagination;
                    throw new MethodCalled('list');
                }
            }

            const service = new MockGroupService();

            try {
                const resolver = new GroupResolver(service as any);
                await resolver.listGroups(new GroupFilterInput());
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
                expect(service.filters).to.be.deep.eq({});
                expect(service.pagination).to.be.deep.eq({
                    page: 1,
                    offset: 0,
                    limit: 10
                });
            }
        });
    });

    describe('GetGroup', () => {
        it('should raise InvalidArgument if by is not instance of GetGroupInput', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                await resolver.getGroup({} as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('by');
            }
        });

        it('should raise InvalidArgument if deleted is number', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                await resolver.getGroup(new GetGroupInput(), 1 as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('deleted');
            }
        });

        it('should raise InvalidArgument if deleted is object', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                await resolver.getGroup(new GetGroupInput(), {} as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('deleted');
            }
        });

        it('should raise InvalidArgument if deleted is string', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                await resolver.getGroup(new GetGroupInput(), 'a' as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('deleted');
            }
        });

        it('should call validate method from by argument', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                const by = new GetGroupInput();
                by.validate = () => { throw new MethodCalled('validate'); };
                await resolver.getGroup(by);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
            }
        });

        it('should call get method from GroupService', async () => {
            class MockGroupService {

                public by: GetGroupInput;
                public deleted: boolean;

                public get(by, deleted) {
                    this.by = by;
                    this.deleted = deleted;
                    throw new MethodCalled('get');
                }
            }

            const service = new MockGroupService();
            const input = new GetGroupInput({ id: '1'.repeat(24) });

            try {
                const resolver = new GroupResolver(service as any);
                await resolver.getGroup(input);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
                expect(service.by).to.be.deep.eq(input);
                expect(service.deleted).to.be.eq(false);
            }
        });

        it('should return group by id', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins' });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            const resolver = new GroupResolver(service as any);

            const input = new GetGroupInput({ id: g._id.toString() });
            const group = await resolver.getGroup(input);
            expect(group).to.be.an('object');
            expect(group).to.have.keys(
                ['id', 'name', 'slug', 'createdAt', 'updatedAt', 'deletedAt', 'deleted', 'count', 'users']
            );
            expect(group.id).to.be.eq(g._id.toString());
            expect(group.name).to.be.eq(g.name);
            expect(group.slug).to.be.eq(g.slug);
            expect(group.createdAt).to.be.eq(g.createdAt);
            expect(group.updatedAt).to.be.eq(g.updatedAt);
            expect(group.deletedAt).to.be.eq(g.deletedAt);
            expect(group.deleted).to.be.eq(g.deleted);
        });

        it('should return group by name', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins' });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            const resolver = new GroupResolver(service as any);

            const input = new GetGroupInput({ name: 'Admins' });
            const group = await resolver.getGroup(input);
            expect(group).to.be.an('object');
            expect(group).to.have.keys(
                ['id', 'name', 'slug', 'createdAt', 'updatedAt', 'deletedAt', 'deleted', 'count', 'users']
            );
            expect(group.id).to.be.eq(g._id.toString());
            expect(group.name).to.be.eq(g.name);
            expect(group.slug).to.be.eq(g.slug);
            expect(group.createdAt).to.be.eq(g.createdAt);
            expect(group.updatedAt).to.be.eq(g.updatedAt);
            expect(group.deletedAt).to.be.eq(g.deletedAt);
            expect(group.deleted).to.be.eq(g.deleted);
        });

        it('should return group by slug', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins' });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            const resolver = new GroupResolver(service as any);

            const input = new GetGroupInput({ slug: 'admins' });
            const group = await resolver.getGroup(input);
            expect(group).to.be.an('object');
            expect(group).to.have.keys(
                ['id', 'name', 'slug', 'createdAt', 'updatedAt', 'deletedAt', 'deleted', 'count', 'users']
            );
            expect(group.id).to.be.eq(g._id.toString());
            expect(group.name).to.be.eq(g.name);
            expect(group.slug).to.be.eq(g.slug);
            expect(group.createdAt).to.be.eq(g.createdAt);
            expect(group.updatedAt).to.be.eq(g.updatedAt);
            expect(group.deletedAt).to.be.eq(g.deletedAt);
            expect(group.deleted).to.be.eq(g.deleted);
        });
    });

    describe('CreateGroup', () => {
        it('should raise InvalidArgument if data is not instance of CreateGroupInput', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                await resolver.createGroup({} as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('data');
            }
        });

        it('should call validate method from data argument', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                const data = new CreateGroupInput();
                data.validate = () => { throw new MethodCalled('validate'); };
                await resolver.createGroup(data);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
            }
        });

        it('should call create method from GroupService', async () => {
            class MockGroupService {

                public name: string;

                public create(name) {
                    this.name = name;
                    throw new MethodCalled('create');
                }
            }

            const service = new MockGroupService();
            const input = new CreateGroupInput({ name: 'name' });

            try {
                const resolver = new GroupResolver(service as any);
                await resolver.createGroup(input);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
                expect(service.name).to.be.eq('name');
            }
        });

        it('should return new group', async () => {
            const db = new MockDatabase();
            const service = new GroupService(db as any);
            const input = new CreateGroupInput({ name: 'Admins' });
            const resolver = new GroupResolver(service as any);

            const group = await resolver.createGroup(input);
            expect(group).to.be.an('object');
            expect(group).to.have.keys(
                ['id', 'name', 'slug', 'createdAt', 'updatedAt', 'deletedAt', 'deleted', 'count', 'users']
            );
            expect(group.name).to.be.eq('Admins');
            expect(group.slug).to.be.eq('admins');
        });
    });

    describe('UpdateGroup', () => {
        it('should raise InvalidArgument if data is not instance of UpdateGroupInput', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                await resolver.updateGroup({} as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('data');
            }
        });

        it('should call validate method from data argument', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                const data = new UpdateGroupInput();
                data.validate = () => { throw new MethodCalled('validate'); };
                await resolver.updateGroup(data);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
            }
        });

        it('should call update method from GroupService', async () => {
            class MockGroupService {

                public name: string;
                public id: string;

                public update(id, name) {
                    this.name = name;
                    this.id = id;
                    throw new MethodCalled('create');
                }
            }

            const service = new MockGroupService();
            const input = new UpdateGroupInput({ id: '1'.repeat(24), name: 'name' });

            try {
                const resolver = new GroupResolver(service as any);
                await resolver.updateGroup(input);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
                expect(service.name).to.be.eq('name');
                expect(service.id).to.be.eq('1'.repeat(24));
            }
        });

        it('should call get method from GroupService', async () => {
            class MockGroupService {
                public by: any;

                public update() {
                    return null;
                }

                public get(by) {
                    this.by = by;
                    throw new MethodCalled('get');
                }
            }

            const service = new MockGroupService();
            const input = new UpdateGroupInput({ id: '1'.repeat(24), name: 'name' });

            try {
                const resolver = new GroupResolver(service as any);
                await resolver.updateGroup(input);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
                expect(e.method).to.be.eq('get');
                expect(service.by).to.be.deep.eq({id: '1'.repeat(24)});
            }
        });

        it('should return updated Group instance', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins' });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            const input = new UpdateGroupInput({ id: g._id.toString(), name: 'name' });
            const resolver = new GroupResolver(service as any);

            const group = await resolver.updateGroup(input);
            expect(group).to.be.an('object');
            expect(group).to.have.keys(
                ['id', 'name', 'slug', 'createdAt', 'updatedAt', 'deletedAt', 'deleted', 'count', 'users']
            );
            expect(group.id).to.be.eq(g._id.toString());
            expect(group.name).to.be.eq('name');
            expect(group.updatedAt).to.be.gt(g.updatedAt);
        });
    });

    describe('DeleteGroup', () => {
        it('should raise InvalidArgument if data is not instance of DeleteGroupInput', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                await resolver.deleteGroup({} as any);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidArgument');
                expect(e.argument).to.be.eq('data');
            }
        });

        it('should call validate method from data argument', async () => {
            try {
                const resolver = new GroupResolver({} as any);
                const data = new DeleteGroupInput();
                data.validate = () => { throw new MethodCalled('validate'); };
                await resolver.deleteGroup(data);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
            }
        });

        it('should call delete method from GroupService', async () => {
            class MockGroupService {
                public id: any;

                public delete(id) {
                    this.id = id;
                    throw new MethodCalled('delete');
                }
            }

            const service = new MockGroupService();
            const input = new DeleteGroupInput({ id: '1'.repeat(24) });

            try {
                const resolver = new GroupResolver(service as any);
                await resolver.deleteGroup(input);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
                expect(e.method).to.be.eq('delete');
                expect(service.id).to.be.deep.eq('1'.repeat(24));
            }
        });

        it('should return true if group exists', async () => {
            const g = new Group({ name: 'Admins', slug: 'admins' });
            const db = new MockDatabase([g]);
            const service = new GroupService(db as any);
            const input = new DeleteGroupInput({ id: g._id.toString() });
            const resolver = new GroupResolver(service as any);

            const result = await resolver.deleteGroup(input);
            expect(result).to.be.eq(true);
        });

        it('should throw error if group not exists', async () => {
            const db = new MockDatabase();
            const service = new GroupService(db as any);
            const input = new DeleteGroupInput({ id: '1'.repeat(24) });
            const resolver = new GroupResolver(service as any);

            try {
                await resolver.deleteGroup(input);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('GroupNotFound');
            }
        });
    });
});
