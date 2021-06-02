import { ReflectHelperService } from "./../decorate/reflect-helper";
import cassandra from "cassandra-driver";
import { ITableCreateDataType } from "./types";
// import { QueryBuilderService } from "./query-builder";
import { EntityTypeInstance, IFieldMetadata } from "../types";

export type IFieldTypeLocal = Record<string, { type: ITableCreateDataType }>;

interface ITableCreate<T> {
  keyspaceName: string;
  entity: EntityTypeInstance<T>;
  cassandraClient: () => cassandra.Client;
}

interface ITableInfo<T> {
  tableName: string;
  partitionKeyMeta: IFieldMetadata;
  sortKeyMeta: IFieldMetadata;
  otherAttributesMeta: IFieldMetadata[];
}

// type IOrderBy<T> = {
//   [P in keyof T]: "asc" | "desc";
// };

export abstract class CassandraOperations<T> {
  private readonly keyspaceName: string;
  private readonly query = cassandra.mapping.q;
  private readonly client: () => cassandra.Client;
  private readonly entity: EntityTypeInstance<T>;
  private entityInstance: T | undefined;
  private tableInfo: ITableInfo<T> | undefined;

  constructor({ keyspaceName, cassandraClient, entity }: ITableCreate<T>) {
    this.keyspaceName = keyspaceName;
    this.entity = entity;
    this.client = () => cassandraClient();
    if (this.query) {
      //
    }
  }

  private async waitUntilMilliseconds(ms: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  private getTargetInstance() {
    if (!this.entityInstance) {
      this.entityInstance = new this.entity();
    }
    return this.entityInstance;
  }

  private getTableInfo() {
    const target01 = this.getTargetInstance();

    const primary = ReflectHelperService.getMetadata_Primary(target01);
    const sortKey = ReflectHelperService.getMetadata_SortKey(target01);
    const attributes = ReflectHelperService.getMetadata_AttributesMap(target01);
    const tableName = ReflectHelperService.getMetadata_TableName(this.entity);

    if (!(tableName && typeof tableName === "string")) {
      throw new Error("tableName must be a string");
    }

    const partitionKey01 = Object.values(primary);
    const sortKey01 = Object.values(sortKey);

    if (!partitionKey01.length) {
      throw new Error(`primary is required for: ${tableName}`);
      //
    } else if (partitionKey01.length > 1) {
      throw new Error(`Multiple primaryKey is NOT allowed (for: ${tableName})`);
    }

    if (!sortKey01.length) {
      throw new Error(`sortKey is required for: ${tableName}`);
      //
    } else if (sortKey01.length > 1) {
      throw new Error(`Multiple sortKey is NOT allowed (for: ${tableName})`);
    }

    if (!this.tableInfo) {
      this.tableInfo = {
        tableName,
        otherAttributesMeta: Object.values(attributes),
        partitionKeyMeta: partitionKey01[0],
        sortKeyMeta: sortKey01[0],
      };
    }
    return { ...this.tableInfo };
  }

  async createTable() {
    const {
      //
      otherAttributesMeta,
      partitionKeyMeta,
      sortKeyMeta,
      tableName,
    } = this.getTableInfo();

    const fullProps = [...otherAttributesMeta, partitionKeyMeta, sortKeyMeta];

    const fieldAnaDataTyeArray: string[] = [];

    fullProps.forEach(({ type, field }) => {
      const fieldAndType = `${field} ${type}`;
      fieldAnaDataTyeArray.push(fieldAndType);
    });

    const comboPrimary = [partitionKeyMeta.field, sortKeyMeta.field].join(",");
    fieldAnaDataTyeArray.push(`PRIMARY KEY (${comboPrimary})`);

    const createTblQuery = [
      `CREATE TABLE IF NOT EXISTS`,
      `${this.keyspaceName}.${tableName}`,
      `(${fieldAnaDataTyeArray.join(", ")});`,
    ].join(" ");

    console.log({ createTblQuery });

    const result = await this.client().execute(createTblQuery, []);
    await this.waitUntilMilliseconds(20000);
    return result;
  }

  /*
  async findBase({
    query,
    limit,
    fields,
    orderBy,
  }: {
    query: IQueryDefinition<T>;
    limit?: number;
    fields?: (keyof T)[];
    orderBy?: IOrderBy<Partial<T>>;
  }) {
    let options: cassandra.mapping.FindDocInfo | undefined = {};

    if (limit) {
      options.limit = limit;
    }
    if (fields?.length) {
      options.fields = fields as string[];
    }

    if (orderBy && Object.keys(orderBy).length) {
      options.orderBy = orderBy;
    }

    const queryValue = QueryBuilderService.generateQuery(query);

    console.log(JSON.stringify({ queryValue }, null, 2));

    if (!queryValue) {
      throw new Error("Invalid query gen");
    }

    if (!Object.keys(options).length) {
      options = undefined;
    }

    const result = await this.getMapper().find(queryValue, options);
    return result.toArray();
  }

  async getAllBase({
    limit,
    fields,
    orderBy,
  }: {
    limit?: number;
    fields?: (keyof T)[];
    orderBy?: IOrderBy<Partial<T>>;
  } = {}) {
    let option01: cassandra.mapping.FindDocInfo | undefined = {};

    if (limit) {
      option01.limit = limit;
    }

    if (fields?.length) {
      option01.fields = fields as string[];
    }

    if (orderBy && Object.keys(orderBy).length) {
      option01.orderBy = orderBy;
    }

    option01 = Object.keys(option01).length ? option01 : undefined;

    const result = await this.getMapper().findAll(option01);
    return result.toArray();
  }

  async createBase({ data, applyToFields }: { data: T; applyToFields?: (keyof T)[] }) {
    const opt = applyToFields ? { fields: applyToFields as string[] } : undefined;
    const result = await this.getMapper().insert(data, opt);
    return result.toArray();
  }
  */

  async selectAll() {
    const target01 = this.getTargetInstance();
    const tableName = ReflectHelperService.getMetadata_TableName(target01);
    const sql = `SELECT * FROM ${this.keyspaceName}.${tableName}`;
    const result = await this.client().execute(sql, []);
    return result.rows;
  }
}
