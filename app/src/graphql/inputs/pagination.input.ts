import { IsIn, IsNumber, Max, Min, ValidateIf } from "class-validator";
import { PaginateOptions } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { Validatable } from '../validatable';

@InputType()
export class PaginationInput extends Validatable implements PaginateOptions {

    @Field({nullable: true, description: 'Current page of query result.'})
    @ValidateIf((object, value) => value !== undefined)
    @IsNumber()
    @Min(1)
    @Max(9999)
    public page?: number;

    @Field({nullable: true, description: 'Current offset from data'})
    @ValidateIf((object, value) => value !== undefined)
    @IsNumber()
    @Min(0)
    public offset?: number;

    @Field({nullable: true, description: 'Max limit of data per page.'})
    @ValidateIf((object, value) => value !== undefined)
    @IsNumber()
    @IsIn([5, 10, 25, 50, 100, 150])
    public limit?: number;

    constructor(data: PaginateOptions = {page: 1, offset: 0, limit: 10}) {
        super(data, ['page', 'offset', 'limit']);
    }
}
