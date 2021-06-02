export type ITableCreateDataType =
  /* picked from
    https://cassandra.apache.org/doc/latest/cql/types.html
    https://docs.aws.amazon.com/keyspaces/latest/devguide/cql.elements.html#cql.data-types
  */
  "boolean" | "uuid" | "date" | "double" | "float" | "int" | "text" | "time" | "timestamp" | "varchar";

export type IFieldType<T> = Record<keyof T, { type: ITableCreateDataType }>;

//
type RequireOnePropertyOnly<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

type TypeFallBack<T> = number extends T ? number : string extends T ? string : T;
type TypeFallBackArray<T> = number extends T ? number[] : string extends T ? string[] : T;

type ICassandraQueryParamBasic<T> = {
  $eq: TypeFallBack<T>;
  $gt: TypeFallBack<T>;
  $gte: TypeFallBack<T>;
  $lt: TypeFallBack<T>;
  $lte: TypeFallBack<T>;
  $notEq: TypeFallBack<T>;
  $in: TypeFallBackArray<T>;
  $and: [
    RequireOnePropertyOnly<ICassandraQueryParamBasic<T>>,
    RequireOnePropertyOnly<ICassandraQueryParamBasic<T>>,
    //
  ];
};

export type ICassandraQueryParams<T> = RequireOnePropertyOnly<ICassandraQueryParamBasic<T>>;

type QueryPartialAllPre<T> = {
  [P in keyof T]: T[P] | ICassandraQueryParams<T[P]>;
};

export type IQueryDefinition<T> = QueryPartialAllPre<Partial<T>>;
