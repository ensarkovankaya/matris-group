import { ICompareDateModel, ICompareNumberModel } from './compare.date.model';

export interface IGroupFilter {
    name?: string;
    slug?: string;
    count?: ICompareNumberModel;
    createdAt?: ICompareDateModel;
    updatedAt?: ICompareDateModel;
    deletedAt?: ICompareDateModel;
    deleted?: boolean;
    users?: string[];
}
