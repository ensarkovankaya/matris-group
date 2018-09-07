import { Logger } from 'matris-logger';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { InvalidArgument } from '../../errors';
import { getLogger } from '../../logger';
import { IUser } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { CreateUserInput } from '../inputs/create.user.input';
import { GetUserInput } from '../inputs/get.user.input';
import { User } from '../schemas/user.schema';

@Service('UserResolver')
@Resolver(of => User)
export class UserResolver {

    private logger: Logger;

    constructor(private us: UserService) {
        this.logger = getLogger('UserResolver', ['resolver']);
    }

    /**
     * Get user entry by id. If user not exists returns null.
     * @param by
     * @param by.id User id
     * @param by.deleted Is user deleted Default false
     * @returns {Promise<IUser | null>}
     */
    @Query(returnType => User, { nullable: true, description: 'Get one user.' })
    public async getUser(@Arg('by') by: GetUserInput): Promise<IUser | null> {
        this.logger.debug('GetUser', { by });
        if (!(by instanceof GetUserInput)) {
            throw new InvalidArgument('by', 'Argument "by" is not instance of GetUserArgs');
        }

        try {
            await by.validate(); // Validate data
            return this.us.get(by.id, by.deleted);
        } catch (e) {
            this.logger.error('GetUser', e, { by });
            throw e;
        }
    }

    /**
     * Create user entry
     * @param data
     * @param data.id User id
     * @returns {IUser}
     */
    @Mutation(returnType => User, {description: 'Create User entry.'})
    public async createUser(@Arg('data') data: CreateUserInput): Promise<IUser> {
        this.logger.debug('CreateUser', { data });
        if (!(data instanceof CreateUserInput)) {
            throw new InvalidArgument('data', 'Argument "data" is not instance of CreateUserInput');
        }

        try {
            await data.validate(); // Validate data
            return this.us.create(data.id);
        } catch (e) {
            this.logger.error('CreateUser', e, { data });
            throw e;
        }
    }
}
