import { model, Schema } from "mongoose";
import * as mongoosePaginate from 'mongoose-paginate';
import { IUserDocument } from "../models/user.model";

/**
 * Stores user registered groups.
 * @property {string} id: User id.
 * @property {string[]} groups: group ids in which the user is registered.
 * @property {Number} count: How many group user registered.
 * @property {Date} createdAt: Entry created date.
 * @property {Date} updatedAt: Entry updated date.
 * @property {Date | null} deletedAt: Entry deleted date.
 * @property {Boolean} deleted: Is entry deleted.
 */
const UserSchema: Schema = new Schema({
    id: {
        minlength: 24,
        maxlength: 24,
        required: true,
        unique: true,
        type: String,
        trim: true,
        match: new RegExp('^[a-zA-Z0-9]+$')
    },
    groups: {
        default: () => new Array(),
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

UserSchema.plugin(mongoosePaginate);

export const User = model<IUserDocument>('User', UserSchema);
