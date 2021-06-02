import "reflect-metadata";
import { IDocorateMetadata } from "../types";

const DefinedKeys = {
  attributes: Symbol("entity:attributes"),
  tablebName: Symbol("entity:tablebName"),
  partitionKey: Symbol("entity:partitionKey"),
  virtual: Symbol("entity:virtual"),
  sortKey: Symbol("entity:sortKey"),
} as const;

class ReflectHelperServiceBase {
  //
  private _getMetadata<T = IDocorateMetadata>({ metadataKey, target }: { metadataKey: symbol; target: Object }): T {
    return Reflect.getMetadata(metadataKey, target) || {};
  }

  private _defineMetadata({
    metadataKey,
    metadataValue,
    target,
  }: {
    metadataKey: symbol;
    metadataValue: any;
    target: Object;
  }) {
    return Reflect.defineMetadata(metadataKey, metadataValue, target);
  }

  defineMetadata_Attribute({ metadataValue, target }: { metadataValue: IDocorateMetadata; target: Object }) {
    return this._defineMetadata({
      metadataKey: DefinedKeys.attributes,
      metadataValue,
      target,
    });
  }

  defineMetadata_Virtual({ metadataValue, target }: { metadataValue: IDocorateMetadata; target: Object }) {
    return this._defineMetadata({
      metadataKey: DefinedKeys.virtual,
      metadataValue,
      target,
    });
  }

  defineMetadata_PartitionKey({ metadataValue, target }: { metadataValue: IDocorateMetadata; target: Object }) {
    return this._defineMetadata({
      metadataKey: DefinedKeys.partitionKey,
      metadataValue,
      target,
    });
  }

  defineMetadata_SortKey({ metadataValue, target }: { metadataValue: IDocorateMetadata; target: Object }) {
    return this._defineMetadata({
      metadataKey: DefinedKeys.sortKey,
      metadataValue,
      target,
    });
  }

  defineMetadata_TableName({ metadataValue, target }: { metadataValue: string; target: Object }) {
    return this._defineMetadata({
      metadataKey: DefinedKeys.tablebName,
      metadataValue,
      target,
    });
  }

  getMetadata_AttributesMap(target: Object) {
    return this._getMetadata({ metadataKey: DefinedKeys.attributes, target });
  }

  getMetadata_Virtual(target: Object) {
    return this._getMetadata({ metadataKey: DefinedKeys.virtual, target });
  }

  getMetadata_PartitionKey(target: Object) {
    return this._getMetadata({ metadataKey: DefinedKeys.partitionKey, target });
  }

  getMetadata_SortKey(target: Object) {
    return this._getMetadata({ metadataKey: DefinedKeys.sortKey, target });
  }

  getMetadata_TableName(target: Object): string {
    return this._getMetadata({ metadataKey: DefinedKeys.tablebName, target });
  }
}

export const ReflectHelperService = new ReflectHelperServiceBase();
