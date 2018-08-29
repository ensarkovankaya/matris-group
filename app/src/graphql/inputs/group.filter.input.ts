import { IsArray, IsBoolean, IsString, Length, ValidateIf } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Validatable } from '../validatable';

@InputType({description: 'User filter options.'})
export class GroupFilterInput extends Validatable  {
    @Field({nullable: true, description: 'Is user active?'})
    @ValidateIf((object, value) => value !== undefined)
    @IsBoolean()
    public deleted?: boolean;

    @Field({nullable: true, description: 'Group name'})
    @ValidateIf((object, value) => value !== undefined)
    @IsString()
    @Length(1, 35)
    public name?: string;

    @Field({nullable: true, description: 'Group slug'})
    @ValidateIf((object, value) => value !== undefined)
    @IsString()
    @Length(1, 35)
    public slug?: string;

    @Field({nullable: true, description: 'Group slug'})
    @ValidateIf((object, value) => value !== undefined)
    @IsArray()
    @Length(24, 24, {each: true})
    public users?: string[];

    constructor(data: object = {}) {
        super(data, ['deleted', 'name', 'slug', 'users']);
    }
}
