import { Arg, Args, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { InvalidArgument } from '../../errors';
import { getLogger, Logger } from "../../logger";
import { GroupService } from '../../services/group.service';
import { CreateGroupInput } from '../inputs/create.group.input';
import { DeleteGroupInput } from '../inputs/delete.group.input';
import { GetGroupInput } from '../inputs/get.group.input';
import { GroupFilterInput } from '../inputs/group.filter.input';
import { PaginationInput } from '../inputs/pagination.input';
import { UpdateGroupInput } from '../inputs/update.group.input';
import { GroupListResultSchema } from '../schemas/group.list.result.schema';
import { Group } from '../schemas/group.schema';

@Service('GroupResolver')
@Resolver(of => Group)
export class GroupResolver {

    private logger: Logger;

    constructor(private gs: GroupService) {
        this.logger = getLogger('GroupResolver', ['resolver']);
    }

    @Query(returnType => GroupListResultSchema, { description: 'Lists group.' })
    public async listGroups(
        @Arg('filters', { nullable: true }) filters: GroupFilterInput = new GroupFilterInput(),
        @Arg('pagination', { nullable: true }) pagination: PaginationInput = new PaginationInput()) {
        if (!(filters instanceof GroupFilterInput)) {
            throw new InvalidArgument('filters', 'Argument "filters" is not instance of GroupFilterInput');
        }
        if (!(pagination instanceof PaginationInput)) {
            throw new InvalidArgument('pagination', 'Argument "pagination" is not instance of PaginationInput');
        }
        try {
            this.logger.debug('List', { filters, pagination });
            await filters.validate();
            await pagination.validate();
            return await this.gs.list(filters, pagination);
        } catch (e) {
            this.logger.error('List', e, { filters, pagination });
            throw e;
        }
    }

    @Query(returnType => Group, { nullable: true, description: 'Get one group by id, name or slug.' })
    public async getGroup(
        @Arg('by', {description: 'Group unique identifier. One of id, name or slug.'}) by: GetGroupInput,
        @Arg('deleted', {
            nullable: true,
            description: 'Is group deleted. Default false.'
        }) deleted: boolean = false): Promise<Group | null> {
        this.logger.debug('Get', { by, deleted });
        if (!(by instanceof GetGroupInput)) {
            throw new InvalidArgument('by', 'Argument "by" is not instance of GroupGetArgs');
        }
        if (typeof deleted !== 'boolean') {
            throw new InvalidArgument('deleted', 'Argument "deleted" not a boolean');
        }

        try {
            await by.validate();
            return await this.gs.get(by, deleted);
        } catch (e) {
            this.logger.error('Get', e, { by, deleted });
            throw e;
        }
    }

    @Mutation(returnType => Group, { description: 'Create Group.' })
    public async createGroup(@Arg('data') data: CreateGroupInput): Promise<Group> {
        if (!(data instanceof CreateGroupInput)) {
            throw new InvalidArgument('data', 'Argument "data" is not instance of CreateGroupInput');
        }
        try {
            this.logger.debug('Create', { data });
            await data.validate();
            return await this.gs.create(data.name);
        } catch (e) {
            this.logger.error('Create', e, { data });
            throw e;
        }
    }

    @Mutation(returnType => Group, { description: 'Update Group.' })
    public async updateGroup(@Arg('data') data: UpdateGroupInput): Promise<Group> {
        if (!(data instanceof UpdateGroupInput)) {
            throw new InvalidArgument('data', 'Argument "data" is not instance of UpdateGroupInput');
        }
        try {
            this.logger.debug('Create', { data });
            await data.validate();
            await this.gs.update(data.id, data.name);
            return this.gs.get({ id: data.id });
        } catch (e) {
            this.logger.error('Update', e, { data });
            throw e;
        }
    }

    @Mutation(returnType => Boolean, { description: 'Delete Group' })
    public async deleteGroup(@Arg('data') data: DeleteGroupInput): Promise<boolean> {
        if (!(data instanceof DeleteGroupInput)) {
            throw new InvalidArgument('data', 'Argument "data" not instance of DeleteGroupInput');
        }
        try {
            this.logger.debug('Delete', { data });
            await data.validate();
            await this.gs.delete(data.id);
            return true;
        } catch (e) {
            this.logger.error('Delete', e, { data });
            throw e;
        }
    }
}
