import { DirectiveNode, FieldNode, VariableNode, InlineFragmentNode, ValueNode, SelectionNode, NameNode, SelectionSetNode, DocumentNode } from 'graphql';
import { FragmentMap } from './fragments';
export interface Reference {
    readonly __ref: string;
}
export declare function makeReference(id: string): Reference;
export declare function isReference(obj: any): obj is Reference;
export declare type StoreValue = number | string | string[] | Reference | Reference[] | null | undefined | void | Object;
export interface StoreObject {
    __typename?: string;
    [storeFieldName: string]: StoreValue;
}
export declare function isDocumentNode(value: any): value is DocumentNode;
export declare function valueToObjectRepresentation(argObj: any, name: NameNode, value: ValueNode, variables?: Object): void;
export declare function storeKeyNameFromField(field: FieldNode, variables?: Object): string;
export declare type Directives = {
    [directiveName: string]: {
        [argName: string]: any;
    };
};
export declare const getStoreKeyName: ((fieldName: string, args?: Record<string, any> | null, directives?: Directives) => string) & {
    setStringify(s: typeof stringify): (value: any) => string;
};
declare let stringify: (value: any) => string;
export declare function argumentsObjectFromField(field: FieldNode | DirectiveNode, variables?: Record<string, any>): Object | null;
export declare function resultKeyNameFromField(field: FieldNode): string;
export declare function getTypenameFromResult(result: Record<string, any>, selectionSet: SelectionSetNode, fragmentMap?: FragmentMap): string | undefined;
export declare function isField(selection: SelectionNode): selection is FieldNode;
export declare function isInlineFragment(selection: SelectionNode): selection is InlineFragmentNode;
export declare type VariableValue = (node: VariableNode) => any;
export {};
//# sourceMappingURL=storeUtils.d.ts.map