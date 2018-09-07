import { IsString, Length, Matches } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { groupNameRegex } from '../../schemas/group.schema';
import { Validatable } from "../validatable";

@InputType()
export class CreateGroupInput extends Validatable {
    @Field({description: 'Group name'})
    @IsString()
    @Length(1, 35)
    @Matches(groupNameRegex)
    public name: string;

    constructor(data: {name?: string} = {}) {
        super(data, ['name']);
    }
}
