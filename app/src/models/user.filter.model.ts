import { ICompareDateModel, ICompareNumberModel } from './compare.date.model';

export interface IUserFilter {
    id?: string;
    count?: ICompareNumberModel;
    createdAt?: ICompareDateModel;
    updatedAt?: ICompareDateModel;
    deletedAt?: ICompareDateModel;
    deleted?: boolean;
    groups?: string[];
}
