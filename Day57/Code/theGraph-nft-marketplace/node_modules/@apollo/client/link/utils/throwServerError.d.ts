export declare type ServerError = Error & {
    response: Response;
    result: Record<string, any>;
    statusCode: number;
};
export declare const throwServerError: (response: Response, result: any, message: string) => never;
//# sourceMappingURL=throwServerError.d.ts.map