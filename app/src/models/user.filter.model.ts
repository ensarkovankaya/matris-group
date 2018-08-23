import { ICompareDateModel, ICompareNumberModel } from './compare.date.model';

export interface IUserFilter {
    count?: ICompareNumberModel;
    createdAt?: ICompareDateModel;
    updatedAt?: ICompareDateModel;
    deletedAt?: ICompareDateModel;
    deleted?: boolean;
    groups?: string[];
}
