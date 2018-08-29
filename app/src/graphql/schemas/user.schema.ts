import { Field, ID, ObjectType } from 'type-graphql';
import { IUser } from '../../models/user.model';

@ObjectType()
export class User implements IUser {

    @Field(type => ID, {description: 'User unique id.'})
    public id: string;

    @Field(type => [String], {description: 'User related groups'})
    public groups: string[];

    @Field({description: 'How many group user in.'})
    public count: number;

    @Field({description: 'Entry creation date.'})
    public createdAt: Date;

    @Field({description: 'Entry last updated date.'})
    public updatedAt: Date;

    @Field({description: 'Entry deleted date.'})
    public deletedAt: Date | null;

    @Field({description: 'Is entry deleted'})
    public deleted: boolean;
}
