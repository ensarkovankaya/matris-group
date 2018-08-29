import { IsMongoId } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Validatable } from "../validatable";

@InputType()
export class AddGroupInput extends Validatable {
    @Field({description: 'User id'})
    @IsMongoId()
    public userId: string;

    @Field({description: 'Group id'})
    @IsMongoId()
    public groupId: string;

    constructor(data = {}) {
        super(data, ['userId', 'groupId']);
    }
}
