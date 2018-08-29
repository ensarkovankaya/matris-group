import { IsMongoId, IsString, Length } from 'class-validator';
import { Field } from 'type-graphql';
import { Validatable } from "../validatable";

export class DeleteGroupInput extends Validatable {
    @Field({description: 'Group id'})
    @IsMongoId()
    public id: string;
}
