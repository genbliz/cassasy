import { UtilService } from "../helpers/util-service";
import { ITableInfo, RequireOnePropertyOnly } from "../types";

interface IQuerySub {
  command: string;
  fieldKey: string;
  action: string;
  value: any;
}

type IQueryAndInput<T> = RequireOnePropertyOnly<T>;
type IQueryOrInput<T> = RequireOnePropertyOnly<T>;
type IQueryGtInput<T> = RequireOnePropertyOnly<T>;

// type IQueryInInput<T> = {
//   [P in keyof T]?: Array<T[P]>;
// };

export class QueryBuilder<T> {
  private andQuery: IQuerySub[] = [];
  private orQuery: IQuerySub[] = [];
  private gtQuery: IQuerySub[] = [];
  private gteQuery: IQuerySub[] = [];
  private ltQuery: IQuerySub[] = [];
  private lteQuery: IQuerySub[] = [];
  private readonly tableInfo: ITableInfo<T>;
  private fields: string[] = [];

  constructor(tableInfo: ITableInfo<T>) {
    this.tableInfo = tableInfo;
  }

  where(query: IQueryAndInput<T>) {
    Object.entries(query).forEach(([fieldKey, value]) => {
      if (value !== undefined) {
        this.andQuery.push({
          command: "WHERE",
          action: "=",
          fieldKey,
          value,
        });
      }
    });
    return this;
  }

  orWhere(query: IQueryOrInput<T>) {
    Object.entries(query).forEach(([fieldKey, value]) => {
      if (value !== undefined) {
        this.orQuery.push({
          command: "WHERE",
          action: "=",
          fieldKey,
          value,
        });
      }
    });
    return this;
  }

  whereGt(query: IQueryGtInput<T>) {
    Object.entries(query).forEach(([fieldKey, value]) => {
      if (value !== undefined) {
        if (typeof value === "string") {
          value = `'${value}'`;
        }
        this.gtQuery.push({
          command: "WHERE",
          action: ">",
          fieldKey,
          value,
        });
      }
    });
    return this;
  }

  whereLt(query: IQueryGtInput<T>) {
    Object.entries(query).forEach(([fieldKey, value]) => {
      if (value !== undefined) {
        if (typeof value === "string") {
          value = `'${value}'`;
        }
        this.ltQuery.push({
          command: "WHERE",
          action: "<",
          fieldKey,
          value,
        });
      }
    });
    return this;
  }

  whereLte(query: IQueryGtInput<T>) {
    Object.entries(query).forEach(([fieldKey, value]) => {
      if (value !== undefined) {
        if (typeof value === "string") {
          value = `'${value}'`;
        }
        this.lteQuery.push({
          command: "WHERE",
          action: "<=",
          fieldKey,
          value,
        });
      }
    });
    return this;
  }

  whereGte(query: IQueryGtInput<T>) {
    Object.entries(query).forEach(([fieldKey, value]) => {
      if (value !== undefined) {
        if (typeof value === "string") {
          value = `'${value}'`;
        }
        this.gteQuery.push({
          command: "WHERE",
          action: ">=",
          fieldKey,
          value,
        });
      }
    });
    return this;
  }

  select(fields: (keyof T)[]) {
    this.fields = [];
    if (fields?.length) {
      fields.forEach((field) => {
        if (field && typeof field === "string") {
          this.fields.push(field);
        }
      });
    }
    return this;
  }

  build() {
    let fields01: string = "*";
    if (this.fields?.length) {
      fields01 = this.fields.join(",");
    }
    const { tableNameFullPath, partitionKeyMeta, sortKeyMeta, otherAttributesMeta } = this.tableInfo;

    const fullFields = [partitionKeyMeta, sortKeyMeta, ...otherAttributesMeta];

    const fullFieldsGrouped = UtilService.groupOneBy(fullFields, (f) => f.key);

    console.log({ fullFieldsGrouped });

    const allowFiltering = true;

    const filtering = `ALLOW FILTERING`;

    let sql = `SELECT ${fields01} FROM ${tableNameFullPath}`;

    if (this.andQuery.length) {
      const andSql = this.andQuery
        .map((f) => {
          const field = fullFieldsGrouped[f.fieldKey].field;
          return [f.command, field, f.action, f.value].join(" ");
        })
        .join(" AND ");
      //
      sql = [sql, andSql].join(" ");
    }

    if (this.orQuery.length) {
      const andSql = this.orQuery
        .map((f) => {
          const field = fullFieldsGrouped[f.fieldKey].field;
          return [f.command, field, f.action, f.value].join(" ");
        })
        .join(" OR ");
      //
      sql = [sql, andSql].join(" ");
    }

    if (this.gtQuery.length) {
      const andSql = this.gtQuery
        .map((f) => {
          const field = fullFieldsGrouped[f.fieldKey].field;
          return [f.command, field, f.action, f.value].join(" ");
        })
        .join(" OR ");
      sql = [sql, andSql].join(" ");
    }

    if (allowFiltering) {
      sql = [sql, filtering].join(" ");
    }
    return sql;
  }
}
