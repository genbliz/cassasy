import { EntityTypeInstance } from "../types";
import { ReflectHelperService } from "./reflect-helper";

export class EntityFactory {
  static fromInputedData<T extends IEntity, TEnt = any>(target: EntityTypeInstance<T>, inputData: unknown): T {
    if (!(inputData && typeof inputData === "object")) {
      throw new Error("Invalid input data");
    }

    const target01 = new target();

    const propsData = ReflectHelperService.getMetadata_AttributesMap(target01);
    const idProperty = ReflectHelperService.getMetadata_PartitionKey(target01);

    const fullProps = {
      ...idProperty,
      ...propsData,
    };

    const undefinedKeys: string[] = [];

    Object.keys(inputData).forEach((key) => {
      if (!fullProps[key]) {
        undefinedKeys.push(key);
      }
    });

    if (undefinedKeys.length) {
      throw new Error(`Properties: [${undefinedKeys.join(", ")}], not defined in class.`);
    }

    Object.values(fullProps).forEach(({ field, key }) => {
      if (inputData[key] !== undefined) {
        target01[key] = inputData[key];
      } else {
        target01[key] = null;
      }
    });
    return target01;
  }

  static fromPersistedData<T extends IEntity>(target: EntityTypeInstance<T>, persistedData: unknown): T {
    if (!(persistedData && typeof persistedData === "object")) {
      throw new Error("Invalid persist data");
    }
    const target01 = new target();

    const propsData = ReflectHelperService.getMetadata_AttributesMap(target01);
    const idProperty = ReflectHelperService.getMetadata_PartitionKey(target01);

    const fullProps = {
      ...idProperty,
      ...propsData,
    };

    Object.values(fullProps).forEach(({ field, key }) => {
      if (persistedData[field] !== undefined) {
        target01[key] = persistedData[key];
      } else {
        target01[key] = null;
      }
    });
    return target01;
  }
}

export interface IEntity {
  toPersistenceData(): any;
  toOutputData(): any;
}

export default class BaseEntity implements IEntity {
  static castFromInput<T extends IEntity>(this: EntityTypeInstance<T>, objData: unknown): T {
    return EntityFactory.fromInputedData(this, objData);
  }

  static castFromPersisted<T extends IEntity>(this: EntityTypeInstance<T>, persistedData: unknown): T {
    return EntityFactory.fromPersistedData(this, persistedData);
  }

  static castFromPersistedList<T extends IEntity>(this: EntityTypeInstance<T>, persistedDataList: unknown[]): T[] {
    return persistedDataList.map((item) => EntityFactory.fromPersistedData(this, item));
  }

  toPersistenceData(): any {
    const output = {} as any;

    const propsData = ReflectHelperService.getMetadata_AttributesMap(this);
    const idProperty = ReflectHelperService.getMetadata_PartitionKey(this);

    const fullData = {
      ...propsData,
      ...idProperty,
    };

    Object.values(fullData).forEach(({ key, field }) => {
      if (this[key]) {
        output[field] = this[key];
      }
    });
    return output;
  }

  toOutputData<TDataOut = any>(): TDataOut {
    const output = {} as any;

    const propsData = ReflectHelperService.getMetadata_AttributesMap(this);
    const idProperty = ReflectHelperService.getMetadata_PartitionKey(this);
    const virtual = ReflectHelperService.getMetadata_Virtual(this);

    const fullData = {
      ...propsData,
      ...idProperty,
      ...virtual,
    };

    Object.values(fullData).forEach(({ key }) => {
      if (this[key]) {
        output[key] = this[key];
      }
    });
    return output;
  }
}
