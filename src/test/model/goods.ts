import BaseEntity from "../../decorate/entity";
import { table, fieldProp, partitionKey, sortKey } from "../../decorate";

export interface IGoods {
  id: string;
  item: string;
  cost: number;
  purchaseDate: string;
}

@table("goods")
export class Goods extends BaseEntity implements IGoods {
  //
  @partitionKey()
  id!: string;

  @fieldProp()
  item!: string;

  @fieldProp({ type: "double" })
  cost!: number;

  @sortKey({ field: "purchase_date" })
  purchaseDate!: string;
}
