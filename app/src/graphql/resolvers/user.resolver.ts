import { Logger } from 'matris-logger';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { PaginationInput } from '../../../../../account/app/src/graphql/inputs/pagination.input';
import { getLogger } from '../../logger';
import { IUser } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { AddGroupInput } from '../inputs/add.group.input';
import { GetUserArgs } from '../inputs/user.get.args';
import { User } from '../schemas/user.schema';

@Service('UserResolver')
@Resolver(of => User)
export class UserResolver {

    private logger: Logger;

    constructor(private us: UserService) {
        this.logger = getLogger('UserResolver', ['resolver']);
    }

    @Query(returnType => User, { nullable: true, description: 'Get one user.' })
    public async get(@Arg('by') by: GetUserArgs): Promise<IUser | null> {
        try {
            this.logger.debug('Get', { by });
            await by.validate();
            return this.us.get(by.id, by.deleted);
        } catch (e) {
            this.logger.error('Get', e, { by });
            throw e;
        }
    }

    @Mutation(returnType => User, { description: 'Add group to User' })
    public async add(@Arg('data', { description: 'Add user to group' }) data: AddGroupInput): Promise<IUser> {
        try {
            this.logger.debug('Add', { data });
        } catch (e) {
            this.logger.error('Add', e, { data });
            throw e;
        }
    }
}
