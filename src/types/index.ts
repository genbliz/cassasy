import { ITableCreateDataType } from "../cassandra/types";

export type IFieldMetadata = { key: string; field: string; type: ITableCreateDataType };
export type IDocorateMetadata = Record<string, IFieldMetadata>;

export type EntityTypeInstance<T> = new (...args: any[]) => T;
