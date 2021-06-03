import { UniqueIdGeneratorService } from "./../helpers/unique-id-generator-service";
import { EntityFactory } from "./../decorate/entity";
import { ReflectHelperService } from "./../decorate/reflect-helper";
import cassandra from "cassandra-driver";
import { QueryBuilderService } from "./query-helper";
import { EntityTypeInstance, IQueryDefinition, ITableCreateDataType, ITableInfo } from "../types";
import { QueryBuilder } from "./query-builder";

export type IFieldTypeLocal = Record<string, { type: ITableCreateDataType }>;

interface ITableCreate<T> {
  keyspaceName: string;
  entity: EntityTypeInstance<T>;
  cassandraClient: () => cassandra.Client;
}

type IOrderBy<T> = {
  [P in keyof T]: "asc" | "desc";
};

export abstract class CassandraOperations<T> {
  private readonly keyspaceName: string;
  private readonly query = cassandra.mapping.q;
  private readonly client: () => cassandra.Client;
  private readonly entityRaw: EntityTypeInstance<T>;
  private entityInstance: T | undefined;
  private tableInfo: ITableInfo<T> | undefined;
  private mapper: cassandra.mapping.ModelMapper<T> | undefined;

  constructor({ keyspaceName, cassandraClient, entity }: ITableCreate<T>) {
    this.keyspaceName = keyspaceName;
    this.entityRaw = entity;
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
      this.entityInstance = new this.entityRaw();
    }
    return this.entityInstance;
  }

  private toPlainObject<T = any>(data: any): T {
    return JSON.parse(JSON.stringify(data));
  }

  private getMapper() {
    if (!this.mapper) {
      const { tableName } = this.getTableInfo();
      const modelKey = [tableName[0].toUpperCase(), tableName.slice(1)].join("");
      const instance = new cassandra.mapping.Mapper(this.client(), {
        models: {
          [modelKey]: {
            mappings: new cassandra.mapping.UnderscoreCqlToCamelCaseMappings(),
            keyspace: this.keyspaceName,
            tables: [tableName],
          },
        },
      });
      this.mapper = instance.forModel<T>(modelKey);
    }
    return this.mapper;
  }

  private getTableInfo() {
    const target01 = this.getTargetInstance();

    const partitionKey = ReflectHelperService.getMetadata_PartitionKey(target01);
    const sortKey = ReflectHelperService.getMetadata_SortKey(target01);
    const attributes = ReflectHelperService.getMetadata_AttributesMap(target01);
    const tableName = ReflectHelperService.getMetadata_TableName(this.entityRaw);

    if (!(tableName && typeof tableName === "string")) {
      throw new Error("tableName must be a string");
    }

    const partitionKey01 = Object.values(partitionKey);
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
        tableNameFullPath: [this.keyspaceName, tableName].join("."),
      };
    }
    return { ...this.tableInfo };
  }

  private toOutPutData(data01: any): T {
    return EntityFactory.fromPersistedData(this.entityRaw as any, data01).toOutputData();
  }

  async createTable() {
    const {
      //
      otherAttributesMeta,
      partitionKeyMeta,
      sortKeyMeta,
      tableNameFullPath,
    } = this.getTableInfo();

    const fullProps = [partitionKeyMeta, sortKeyMeta, ...otherAttributesMeta];

    const fieldAnaDataTyeArray: string[] = [];

    fullProps.forEach(({ type, field }) => {
      fieldAnaDataTyeArray.push(`${field} ${type}`);
    });

    const comboPrimary = [partitionKeyMeta.field, sortKeyMeta.field].join(",");
    fieldAnaDataTyeArray.push(`PRIMARY KEY (${comboPrimary})`);

    const createTblQuery = [
      `CREATE TABLE IF NOT EXISTS`,
      `${tableNameFullPath}`,
      `(${fieldAnaDataTyeArray.join(", ")});`,
    ].join(" ");

    console.log({ createTblQuery });

    const result = await this.client().execute(createTblQuery);
    await this.waitUntilMilliseconds(20000);
    return result;
  }

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
    const { tableNameFullPath } = this.getTableInfo();

    let fields01: string = "*";
    if (fields?.length) {
      fields01 = fields.join(",");
    }

    const sql = `SELECT ${fields01} FROM ${tableNameFullPath} WHERE cost > 2000 ALLOW FILTERING`;
    const result = await this.client().execute(sql);

    return this.toPlainObject<T[]>(result?.rows || []);
  }

  queryBuilder() {
    return new QueryBuilder<T>(this.getTableInfo());
  }

  async findByQuery(query: string | QueryBuilder<T>) {
    const sql = typeof query === "string" ? query : query.build();
    console.log({ sql });
    const result = await this.client().execute(sql);
    const result01 = this.toPlainObject<T[]>(result.rows || []);
    return result01;
  }

  async findBase00({
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

  /*
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
  */

  async createBase({ data }: { data: T }) {
    const { tableNameFullPath, partitionKeyMeta, sortKeyMeta } = this.getTableInfo();

    const data01 = { ...data };

    const dataForPersist = EntityFactory.fromInputedData(this.entityRaw as any, data01).toPersistenceData();

    if (!(dataForPersist && typeof dataForPersist === "object")) {
      throw new Error("Invalid persist data");
    }

    if (!dataForPersist[partitionKeyMeta.field]) {
      dataForPersist[partitionKeyMeta.field] = UniqueIdGeneratorService.getTimeStampGuid();
    }

    if (!dataForPersist[sortKeyMeta.field]) {
      throw new Error("sortKey is required");
    }

    const dataToDbString = JSON.stringify(dataForPersist);
    const sql = `INSERT INTO ${tableNameFullPath} JSON '${dataToDbString}'`;

    console.log({ sql });

    console.time(tableNameFullPath);

    await this.client().execute(sql);

    console.timeEnd(tableNameFullPath);
    return dataForPersist;
  }

  async getAllBase() {
    const { tableNameFullPath } = this.getTableInfo();
    const sql = `SELECT * FROM ${tableNameFullPath}`;
    const result = await this.client().execute(sql, []);
    const result01 = this.toPlainObject<T[]>(result.rows || []);
    if (result01?.length) {
      return result01.map((f) => this.toOutPutData(f));
    }
    return [];
  }
}
