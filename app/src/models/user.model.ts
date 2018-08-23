import { Document } from 'mongoose';

export interface IUserDocument extends Document {
    user: string;
    groups: string[];
    count: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deleted: boolean;
}

export interface IUser {
    user: string;
    groups: string[];
    count: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deleted: boolean;
}
