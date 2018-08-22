import { Document } from "mongoose";

export interface IGroupDocument extends Document {
    name: string;
    slug: string;
    users: string[];
    count: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deleted: boolean;
}

export interface IGroup {
    id: string;
    name: string;
    slug: string;
    users: string[];
    count: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deleted: boolean;
}
