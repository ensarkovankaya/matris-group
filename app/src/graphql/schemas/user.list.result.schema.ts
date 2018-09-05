import { PaginateResult } from 'mongoose';
import { Field, Int, ObjectType } from 'type-graphql';
import { User } from './user.schema';

@ObjectType()
export class UserListResultSchema implements PaginateResult<User> {
    @Field(type => [User], {description: 'Users'})
    public docs: User[];

    @Field(type => Int, {description: 'Total number of data returned from search.'})
    public total: number;

    @Field(type => Int, {description: 'Total number of data per page.'})
    public limit: number;

    @Field(type => Int, {nullable: true, description: 'Current page number.'})
    public page?: number;

    @Field(type => Int, {nullable: true, description: 'Total number of pages.'})
    public pages?: number;

    @Field(type => Int, {nullable: true, description: 'Offset'})
    public offset?: number;
}
