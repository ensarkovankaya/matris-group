import { IsLowercase, IsMongoId, IsString, Length, Matches, ValidateIf } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { groupNameRegex, groupSlugRegex } from '../../schemas/group.schema';
import { Validatable } from '../validatable';

@InputType()
export class GetGroupInput extends Validatable {
    @Field({nullable: true, description: 'Get user by id.'})
    @ValidateIf((object, value) => value !== undefined)
    @IsString()
    @Length(24, 24)
    @IsMongoId()
    public id?: string;

    @Field({nullable: true, description: 'Get user by username.'})
    @ValidateIf((object, value) => value !== undefined)
    @IsString()
    @Length(1, 35, {message: 'InvalidLength'})
    @Matches(groupNameRegex)
    public name?: string;

    @Field({nullable: true, description: 'Get user by email.'})
    @ValidateIf((object, value) => value !== undefined)
    @IsString()
    @Length(1, 35, {message: 'InvalidLength'})
    @IsLowercase({message: 'NotLowercase'})
    @Matches(groupSlugRegex)
    public slug?: string;

    constructor(data: {id?: string, name?: string, slug?: string} = {}) {
        super(data, ['id', 'name', 'slug']);
    }
}
