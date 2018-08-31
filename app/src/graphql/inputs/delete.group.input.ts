import { IsMongoId } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Validatable } from "../validatable";
@InputType()
export class DeleteGroupInput extends Validatable {
    @Field({description: 'Group id'})
    @IsMongoId()
    public id: string;

    constructor(data = {}) {
        super(data, ['id']);
    }
}
