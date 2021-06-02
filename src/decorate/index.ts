import "reflect-metadata";
import { ReflectHelperService } from "./reflect-helper";
import { IDocorateMetadata } from "../types";
import { ITableCreateDataType } from "src/cassandra/types";

export function tableOverride(entityName: string) {
  return function entityOverride<T extends { new (...args: any[]): {} }>(constructor: T) {
    ReflectHelperService.defineMetadata_TableName({
      metadataValue: entityName,
      target: constructor,
    });
    return class extends constructor {
      reportingURL = "http://www...";
    };
  };
}

export function table(entityName: string) {
  return function (constructor: Function) {
    ReflectHelperService.defineMetadata_TableName({
      metadataValue: entityName,
      target: constructor,
    });
  };
}

export function fieldProp({ field, type }: { field?: string; type?: ITableCreateDataType } = {}) {
  return function (target: Object, propertyKey: string) {
    const metadataValue = ReflectHelperService.getMetadata_AttributesMap(target);
    if (!metadataValue[propertyKey]) {
      const field01 = field || propertyKey;
      metadataValue[propertyKey] = {
        field: field01,
        key: propertyKey,
        type: type || "varchar",
      };
      ReflectHelperService.defineMetadata_Attribute({ metadataValue, target });
    }
  };
}

export function virtualProp({ type }: { type?: ITableCreateDataType } = {}) {
  return function (target: Object, propertyKey: string) {
    const metadataValue = ReflectHelperService.getMetadata_Virtual(target);
    if (!metadataValue[propertyKey]) {
      metadataValue[propertyKey] = {
        key: propertyKey,
        field: propertyKey,
        type: type || "varchar",
      };
      ReflectHelperService.defineMetadata_Virtual({ metadataValue, target });
    }
  };
}

export function partitionKey({ field, type }: { field?: string; type?: ITableCreateDataType } = {}) {
  return function (target: Object, propertyKey: string) {
    const field01 = field || propertyKey;
    const metadataValue: IDocorateMetadata = {
      [propertyKey]: {
        field: field01,
        key: propertyKey,
        type: type || "varchar",
      },
    };
    ReflectHelperService.defineMetadata_PartitionKey({ metadataValue, target });
  };
}

export function sortKey({ field, type }: { field?: string; type?: ITableCreateDataType } = {}) {
  return function (target: Object, propertyKey: string) {
    const field01 = field || propertyKey;
    const metadataValue: IDocorateMetadata = {
      [propertyKey]: {
        field: field01,
        key: propertyKey,
        type: type || "varchar",
      },
    };
    ReflectHelperService.defineMetadata_SortKey({ metadataValue, target });
  };
}

/*
cassasy

export function configurable(value: boolean) {
  return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value;
  };
}

const requiredMetadataKey = Symbol("required");

export function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}

export function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
  let method = descriptor.value!;

  descriptor.value = function () {
    let requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
    if (requiredParameters) {
      for (let parameterIndex of requiredParameters) {
        if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {
          throw new Error("Missing required argument.");
        }
      }
    }
    return method.apply(this, arguments);
  };
}
*/
