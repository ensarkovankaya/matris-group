import { IsString, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Validatable } from "../validatable";

@InputType()
export class CreateGroupInput extends Validatable {
    @Field({description: 'Group name'})
    @IsString()
    @Length(1, 35)
    public name: string;

    constructor(data = {}) {
        super(data, ['name']);
    }
}
