import { IsMongoId, IsString, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Validatable } from "../validatable";
@InputType()
export class DeleteGroupInput extends Validatable {
    @Field({description: 'Group id'})
    @IsString()
    @IsMongoId()
    @Length(24, 24)
    public id: string;

    constructor(data: {id?: string} = {}) {
        super(data, ['id']);
    }
}
