import { CassandraOperations } from "../cassandra/base";
// import fs from "fs";
// import { v4 as uuidV4 } from "uuid";
import { CassandraConnection } from "./connection";
import { Goods, IGoods } from "./person";

class CassandraImplementBase extends CassandraOperations<IGoods> {
  constructor() {
    super({
      cassandraClient: () => CassandraConnection.getClient(),
      keyspaceName: "hospimandb",
      entity: Goods,
    });
  }

  createTabl() {
    return super.createTable();
  }

  /*

    getAll() {
    return this.getAllBase({
      fields: ["id", "name"],
      limit: 2,
      orderBy: { id: "asc" },
    });
  }

  find() {
    return this.findBase({
      query: {
        id: "45ec0277-3d7b-489f-991b-d0e851e56b6a",
        shortCode: { $gte: 500 },
      },
    });
  }

  async inserts() {
    try {
      await tableOp.createTable();

      console.time();

      const inserts = Array(1000)
        .fill(0)
        .map(() => {
          return this.createBase({
            data: {
              id: uuidV4(),
              name: new Date().toISOString(),
              shortCode: Math.round(Math.random() * 9999),
            },
          });
        });

      await Promise.all(inserts);

      const tenants = await this.getAllBase();
      console.timeEnd();
      fs.writeFileSync(`temp/out/inserts-${Date.now()}.json`, JSON.stringify(tenants, null, 2), { encoding: "utf-8" });
      // console.log(JSON.parse(JSON.stringify({ tenants })));
      console.timeEnd();
      //
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(0);
    }
  }*/
}

export const CassandraImplement = new CassandraImplementBase();

CassandraImplement.createTabl().catch((e) => console.log(e));

// ts-node ./src/test/index.ts
