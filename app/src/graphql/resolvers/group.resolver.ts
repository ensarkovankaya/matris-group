import { Arg, Args, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { getLogger, Logger } from "../../logger";
import { GroupService } from '../../services/group.service';
import { CreateGroupInput } from '../inputs/create.group.input';
import { DeleteGroupInput } from '../inputs/delete.group.input';
import { GroupFilterInput } from '../inputs/group.filter.input';
import { GroupGetArgs } from '../inputs/group.get.args';
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
    public async list(
        @Arg('filters', { nullable: true }) filters: GroupFilterInput = new GroupFilterInput(),
        @Arg('pagination', { nullable: true }) pagination: PaginationInput = new PaginationInput()) {
        this.logger.debug('List', { filters, pagination });
        await filters.validate();
        await pagination.validate();
        return await this.gs.list(filters, pagination);
    }

    @Query(returnType => Group, { nullable: true, description: 'Get one group by id, name or slug.' })
    public async get(@Args() by: GroupGetArgs,
                     @Arg('deleted', {
                         nullable: true,
                         description: 'Is group deleted. Default false.'
                        }) deleted: boolean = false): Promise<Group | null> {
        this.logger.debug('Get', { by });
        await by.validate();
        return await this.gs.get(by, deleted);
    }

    @Mutation(returnType => Group, {description: 'Create Group.'})
    public async create(@Args() data: CreateGroupInput): Promise<Group> {
        this.logger.debug('Create', { data });
        await data.validate();
        return await this.gs.create(data.name);
    }

    @Mutation(returnType => Group, {description: 'Update Group.'})
    public async update(@Args() data: UpdateGroupInput): Promise<Group> {
        this.logger.debug('Create', { data });
        await data.validate();
        await this.gs.update(data.id, data.name);
        return this.gs.get({id: data.id});
    }

    @Mutation(returnType => Boolean, {description: 'Delete Group'})
    public async delete(@Args() data: DeleteGroupInput): Promise<boolean> {
        this.logger.debug('Delete', { data });
        await data.validate();
        await this.gs.delete(data.id);
        return true;
    }
}
