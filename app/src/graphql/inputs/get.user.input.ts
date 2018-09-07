import { IsBoolean, IsMongoId, IsString, Length, ValidateIf } from "class-validator";
import {Field, InputType } from 'type-graphql';
import { Validatable } from '../validatable';

@InputType()
export class GetUserInput extends Validatable {
    @Field({description: 'User id.'})
    @IsString()
    @Length(24, 24)
    @IsMongoId()
    public id: string;

    @Field({nullable: true, description: 'Is user entry deleted'})
    @ValidateIf((object, value) => value !== undefined)
    @IsBoolean()
    public deleted?: boolean;

    constructor(data: {id: string, deleted?: boolean} = {id: ''}) {
        super({deleted: false, ...data}, ['id', 'deleted']);
    }
}
