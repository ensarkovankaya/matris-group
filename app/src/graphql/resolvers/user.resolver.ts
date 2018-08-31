import { Logger } from 'matris-logger';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { PaginationInput } from '../../../../../account/app/src/graphql/inputs/pagination.input';
import { InvalidArgument } from '../../errors';
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
        if (!(by instanceof GetUserArgs)) {
            throw new InvalidArgument('by', 'Argument "by" not instance of GetUserArgs');
        }
        try {
            this.logger.debug('Get', { by });
            await by.validate();
            return this.us.get(by.id, by.deleted);
        } catch (e) {
            this.logger.error('Get', e, { by });
            throw e;
        }
    }
}
