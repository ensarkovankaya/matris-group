import { IsBoolean, IsMongoId, ValidateIf } from "class-validator";
import { ArgsType, Field } from 'type-graphql';
import { Validatable } from '../validatable';

@ArgsType()
export class GetUserArgs extends Validatable {
    @Field({description: 'User id.'})
    @IsMongoId()
    public id: string;

    @Field({nullable: true, description: 'Is user entry deleted'})
    @ValidateIf((object, value) => value !== undefined)
    @IsBoolean()
    public deleted?: boolean;

    constructor(data = {}) {
        super({deleted: false, ...data}, ['id', 'deleted']);
    }
}
