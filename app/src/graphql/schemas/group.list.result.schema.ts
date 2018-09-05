import { PaginateResult } from 'mongoose';
import { Field, Int, ObjectType } from 'type-graphql';
import { Group } from './group.schema';

@ObjectType()
export class GroupListResultSchema implements PaginateResult<Group> {
    @Field(type => [Group], {description: 'Groups'})
    public docs: Group[];

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
