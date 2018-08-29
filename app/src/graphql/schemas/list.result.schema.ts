import { PaginateResult } from 'mongoose';
import { Field, ObjectType } from 'type-graphql';
import { Group } from './group.schema';

@ObjectType()
export class ListResultSchema implements PaginateResult<Group> {
    @Field(type => [Group], {description: 'Groups'})
    public docs: Group[];

    @Field({description: 'Total number of data returned from search.'})
    public total: number;

    @Field({description: 'Total number of data per page.'})
    public limit: number;

    @Field({nullable: true, description: 'Current page number.'})
    public page?: number;

    @Field({nullable: true, description: 'Total number of pages.'})
    public pages?: number;

    @Field({nullable: true, description: 'Offset'})
    public offset?: number;
}
