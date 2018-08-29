import { IsMongoId, IsString, Length } from 'class-validator';
import { Field } from 'type-graphql';
import { Validatable } from "../validatable";

export class UpdateGroupInput extends Validatable {
    @Field({description: 'Group name'})
    @IsString()
    @Length(1, 35)
    public name: string;

    @Field({description: 'Group id'})
    @IsMongoId()
    public id: string;

    constructor(data = {}) {
        super(data, ['id', 'name']);
    }
}
