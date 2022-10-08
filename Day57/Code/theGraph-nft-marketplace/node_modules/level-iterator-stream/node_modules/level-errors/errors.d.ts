interface LevelUPError extends Error { }
interface InitializationError extends LevelUPError { }
interface OpenError extends LevelUPError { }
interface ReadError extends LevelUPError { }
interface WriteError extends LevelUPError { }
interface NotFoundError extends Error {
  notFound: any;
  status: any;
}
interface EncodingError extends LevelUPError { }

interface LevelUPErrorConstructor<TError> {
  new(message?: string, cause?: any): TError;
  (message?: string, cause?: any): TError;
  readonly prototype: TError;
}

declare namespace levelerrors {
  export var LevelUPError: LevelUPErrorConstructor<LevelUPError>;
  export var InitializationError: LevelUPErrorConstructor<InitializationError>;
  export var OpenError: LevelUPErrorConstructor<OpenError>;
  export var ReadError: LevelUPErrorConstructor<ReadError>;
  export var WriteError: LevelUPErrorConstructor<WriteError>;
  export var NotFoundError: LevelUPErrorConstructor<NotFoundError>;
  export var EncodingError: LevelUPErrorConstructor<EncodingError>;
}

export = levelerrors