import { ICompareDateModel, ICompareNumberModel } from './compare.date.model';

export interface IUserFilter {
    user?: {
        eq?: string;
        in?: string[];
    };
    count?: ICompareNumberModel;
    createdAt?: ICompareDateModel;
    updatedAt?: ICompareDateModel;
    deletedAt?: ICompareDateModel;
    deleted?: boolean;
    groups?: string[];
}
