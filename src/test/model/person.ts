import BaseEntity from "../../decorate/base-entity";
import { table, fieldProp, partitionKey, sortKey, virtualProp } from "../../decorate";

export interface IPatient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

@table("patients")
export class Patient extends BaseEntity implements IPatient {
  //
  @partitionKey({ type: "varchar" })
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
