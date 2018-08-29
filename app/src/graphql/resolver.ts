import { Arg, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { getLogger, Logger } from "../logger";
import { GroupService } from '../services/group.service';
import { GroupFilterInput } from './inputs/group.filter.input';
import { PaginationInput } from './inputs/pagination.input';
import { Group } from './schemas/group.schema';
import { ListResultSchema } from './schemas/list.result.schema';

@Service('GroupResolver')
@Resolver(of => Group)
export class GroupResolver {
    private logger: Logger;

    constructor(private gs: GroupService) {
        this.logger = getLogger('GroupResolver', ['resolver']);
    }

    @Query(returnType => ListResultSchema, { description: 'Find group.' })
    public async list(@Arg('filters') filters: GroupFilterInput,
                      @Arg('pagination', { nullable: true }) pagination: PaginationInput = new PaginationInput()) {
        this.logger.debug('List', { filters, pagination });
        await new GroupFilterInput(filters).validate();
        await new PaginationInput(pagination).validate();
        return await this.gs.list(filters, pagination);
    }
}
