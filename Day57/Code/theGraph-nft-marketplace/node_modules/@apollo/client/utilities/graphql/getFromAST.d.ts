import { DocumentNode, OperationDefinitionNode, FragmentDefinitionNode } from 'graphql';
export declare function checkDocument(doc: DocumentNode): DocumentNode;
export declare function getOperationDefinition(doc: DocumentNode): OperationDefinitionNode | undefined;
export declare function getOperationName(doc: DocumentNode): string | null;
export declare function getFragmentDefinitions(doc: DocumentNode): FragmentDefinitionNode[];
export declare function getQueryDefinition(doc: DocumentNode): OperationDefinitionNode;
export declare function getFragmentDefinition(doc: DocumentNode): FragmentDefinitionNode;
export declare function getMainDefinition(queryDoc: DocumentNode): OperationDefinitionNode | FragmentDefinitionNode;
export declare function getDefaultValues(definition: OperationDefinitionNode | undefined): Record<string, any>;
//# sourceMappingURL=getFromAST.d.ts.map