import "reflect-metadata";
import { IDocorateMetadata } from "../types";

const DefinedKeys = {
  properties: Symbol("entity_properties"),
  entityName: Symbol("entity_name"),
  primaryKey: Symbol("entity_primaryKey"),
  virtual: Symbol("entity_virtual"),
  sortKey: Symbol("entity_sortKey"),
} as const;

class ReflectHelperServiceBase {
  //
  private _getMetadata<T = IDocorateMetadata>({ metadataKey, target }: { metadataKey: symbol; target: Object }): T {
    const nny = Reflect.getMetadata(metadataKey, target) || {};
    console.log({ nny, metadataKey });
    return nny;
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
      metadataKey: DefinedKeys.properties,
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

  defineMetadata_Primary({ metadataValue, target }: { metadataValue: IDocorateMetadata; target: Object }) {
    return this._defineMetadata({
      metadataKey: DefinedKeys.primaryKey,
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
      metadataKey: DefinedKeys.entityName,
      metadataValue,
      target,
    });
  }

  getMetadata_AttributesMap(target: Object) {
    return this._getMetadata({ metadataKey: DefinedKeys.properties, target });
  }

  getMetadata_Virtual(target: Object) {
    return this._getMetadata({ metadataKey: DefinedKeys.virtual, target });
  }

  getMetadata_Primary(target: Object) {
    return this._getMetadata({ metadataKey: DefinedKeys.primaryKey, target });
  }

  getMetadata_SortKey(target: Object) {
    return this._getMetadata({ metadataKey: DefinedKeys.sortKey, target });
  }

  getMetadata_TableName(target: Object): string {
    return this._getMetadata({ metadataKey: DefinedKeys.entityName, target });
  }
}

export const ReflectHelperService = new ReflectHelperServiceBase();
