import { IsArray, IsBoolean, IsLowercase, IsMongoId, IsString, Length, Matches, ValidateIf } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { groupNameRegex, groupSlugRegex } from '../../schemas/group.schema';
import { Validatable } from '../validatable';

@InputType({description: 'Group filter options.'})
export class GroupFilterInput extends Validatable  {
    @Field({nullable: true, description: 'Is user active?'})
    @ValidateIf((object, value) => value !== undefined)
    @IsBoolean()
    public deleted?: boolean;

    @Field({nullable: true, description: 'Group name'})
    @ValidateIf((object, value) => value !== undefined)
    @IsString({message: 'NotString'})
    @Length(1, 35, {message: 'InvalidLength'})
    @Matches(groupNameRegex)
    public name?: string;

    @Field({nullable: true, description: 'Group slug'})
    @ValidateIf((object, value) => value !== undefined)
    @IsString({message: 'NotString'})
    @Length(1, 35, {message: 'InvalidLength'})
    @IsLowercase({message: 'NotLowercase'})
    @Matches(groupSlugRegex)
    public slug?: string;

    @Field(type => [String], {nullable: true, description: 'Group slug'})
    @ValidateIf((object, value) => value !== undefined)
    @IsArray()
    @IsString({each: true})
    @Length(24, 24, {each: true})
    @IsMongoId({each: true})
    public users?: string[];

    constructor(data: {deleted?: boolean, name?: string, slug?: string, users?: string[]} = {}) {
        super(data, ['deleted', 'name', 'slug', 'users', 'createdAt', 'updatedAt', 'deletedAt', 'deleted']);
    }
}
