import { model, Schema } from "mongoose";
import * as mongoosePaginate from 'mongoose-paginate';
import { matches } from 'validator';
import { IGroupDocument } from "./group.model";

const GroupSchema: Schema = new Schema({
    name: {
        minlength: 1,
        maxLength: 35,
        required: true,
        type: String,
        trim: true,
        validate: {
            validator: (value: any) => matches(value, new RegExp('^[a-zA-Z0-9 ]+$')),
            msg: 'Invalid name',
            type: 'matches'
        }
    },
    slug: {
        minlength: 1,
        maxLength: 35,
        required: true,
        unique: true,
        type: String,
        trim: true,
        lowercase: true,
        validate: [
            {
                validator: (value: any) => matches(value, new RegExp('^[a-z0-9\-]+$')),
                msg: 'Invalid slug',
                type: 'matches'
            }
        ]
    },
    users: {
        default: new Array(),
        type: Array,
        required: true,
        validate: {
            // Check values are unique
            validator: (value: string[]) => new Set(value).size === value.length,
            msg: 'Duplicate values',
            type: 'duplicate'
        }
    },
    count: {
        type: Number,
        min: 0,
        max: 250,
        default: 0,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

GroupSchema.plugin(mongoosePaginate);

export const Group = model<IGroupDocument>('Group', GroupSchema);
