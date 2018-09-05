import { IsString, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Validatable } from "../validatable";

@InputType()
export class CreateUserInput extends Validatable {
    @Field({description: 'User Id'})
    @IsString()
    @Length(24, 24)
    public id: string;

    constructor(data = {}) {
        super(data, ['id']);
    }
}
