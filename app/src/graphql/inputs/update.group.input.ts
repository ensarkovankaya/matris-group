import { IsMongoId, IsString, Length, Matches } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { groupNameRegex } from '../../schemas/group.schema';
import { Validatable } from "../validatable";

@InputType()
export class UpdateGroupInput extends Validatable {
    @Field({description: 'Group name'})
    @IsString()
    @Length(1, 35)
    @Matches(groupNameRegex)
    public name: string;

    @Field({description: 'Group id'})
    @IsString()
    @Length(24, 24)
    @IsMongoId()
    public id: string;

    constructor(data: {name: string, id: string} = {name: '', id: ''}) {
        super(data, ['id', 'name']);
    }
}
