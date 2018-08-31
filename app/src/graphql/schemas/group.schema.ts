import { Field, ID, ObjectType } from 'type-graphql';
import { IGroup } from '../../models/group.model';

@ObjectType({description: 'Group object'})
export class Group implements IGroup {
    @Field(type => ID, {description: 'Group unique ID.'})
    public id: string;

    @Field({description: 'Group name.'})
    public name: string;

    @Field({description: 'Group slug.'})
    public slug: string;

    @Field(type => [String], {description: 'Group users ids.'})
    public users: string[];

    @Field({description: 'User count.'})
    public count: number;

    @Field({description: 'Group create date.'})
    public createdAt: Date;

    @Field({description: 'Group update date.'})
    public updatedAt: Date;

    @Field({description: 'Group delete date.'})
    public deletedAt: Date | null;

    @Field({description: 'Is group deleted.'})
    public deleted: boolean;
}
