import { DocumentNode } from 'graphql';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { MissingFieldError } from './common';
export declare namespace DataProxy {
    interface Query<TVariables, TData> {
        query: DocumentNode | TypedDocumentNode<TData, TVariables>;
        variables?: TVariables;
        id?: string;
    }
    interface Fragment<TVariables, TData> {
        id?: string;
        fragment: DocumentNode | TypedDocumentNode<TData, TVariables>;
        fragmentName?: string;
        variables?: TVariables;
    }
    interface ReadQueryOptions<TData, TVariables> extends Query<TVariables, TData> {
        returnPartialData?: boolean;
        optimistic?: boolean;
        canonizeResults?: boolean;
    }
    interface ReadFragmentOptions<TData, TVariables> extends Fragment<TVariables, TData> {
        returnPartialData?: boolean;
        optimistic?: boolean;
        canonizeResults?: boolean;
    }
    interface WriteOptions<TData> {
        data: TData;
        broadcast?: boolean;
        overwrite?: boolean;
    }
    interface WriteQueryOptions<TData, TVariables> extends Query<TVariables, TData>, WriteOptions<TData> {
    }
    interface WriteFragmentOptions<TData, TVariables> extends Fragment<TVariables, TData>, WriteOptions<TData> {
    }
    interface UpdateQueryOptions<TData, TVariables> extends Omit<(ReadQueryOptions<TData, TVariables> & WriteQueryOptions<TData, TVariables>), 'data'> {
    }
    interface UpdateFragmentOptions<TData, TVariables> extends Omit<(ReadFragmentOptions<TData, TVariables> & WriteFragmentOptions<TData, TVariables>), 'data'> {
    }
    type DiffResult<T> = {
        result?: T;
        complete?: boolean;
        missing?: MissingFieldError[];
        fromOptimisticTransaction?: boolean;
    };
}
export interface DataProxy {
    readQuery<QueryType, TVariables = any>(options: DataProxy.ReadQueryOptions<QueryType, TVariables>, optimistic?: boolean): QueryType | null;
    readFragment<FragmentType, TVariables = any>(options: DataProxy.ReadFragmentOptions<FragmentType, TVariables>, optimistic?: boolean): FragmentType | null;
    writeQuery<TData = any, TVariables = any>(options: DataProxy.WriteQueryOptions<TData, TVariables>): void;
    writeFragment<TData = any, TVariables = any>(options: DataProxy.WriteFragmentOptions<TData, TVariables>): void;
}
//# sourceMappingURL=DataProxy.d.ts.map