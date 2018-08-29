import { Document } from 'mongoose';
import { IGroup } from './group.model';

export interface IUserDocument extends Document {
    id: string;
    groups: string[];
    count: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deleted: boolean;
}

export interface IUser {
    id: string;
    groups: IGroup[];
    count: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deleted: boolean;
}
