import BaseEntity from "../decorate/base-entity";
import { table, fieldProp, primary, sortKey, virtualProp } from "../decorate";

export interface IPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

@table("persons")
export class Person extends BaseEntity implements IPerson {
  //
  @primary({ type: "varchar" })
  id!: string;

  @sortKey({ field: "created_at" })
  createdAt!: string;

  @fieldProp({ field: "first_name" })
  firstName!: string;

  @fieldProp({ field: "last_name" })
  lastName!: string;

  @fieldProp({ type: "varchar" })
  email!: string;

  @virtualProp()
  get fullName() {
    return [this.firstName, this.lastName].filter((x) => x).join(" ");
  }
}

export interface IGoods {
  id: string;
  item: string;
  cost: number;
  purchaseDate: string;
}

@table("goodsa")
export class Goods extends BaseEntity implements IGoods {
  //
  @primary()
  id!: string;

  @fieldProp()
  item!: string;

  @fieldProp({ type: "double" })
  cost!: number;

  @sortKey({ field: "purchase_date" })
  purchaseDate!: string;
}
