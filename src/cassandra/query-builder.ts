import cassandra from "cassandra-driver";

const conditionKeyMap = {
  $eq: "$eq",
  $gt: "$gt",
  $gte: "$gte",
  $lt: "$lt",
  $lte: "$lte",
  $notEq: "$notEq",
  $in: "$in",
  $and: "$and",
} as const;

function hasQueryConditionKey(key: string) {
  return Object.keys(conditionKeyMap).includes(key);
}

class QueryBuilderServiceBase {
  private cassandraMapperQuery = () => cassandra.mapping.q;

  private getQueryMapValue({ querykey, queryval }: { querykey: any; queryval: any }) {
    let myQueryVal: any = null;
    if (querykey === conditionKeyMap.$eq) {
      myQueryVal = queryval;
    } else if (querykey === conditionKeyMap.$gt) {
      myQueryVal = this.cassandraMapperQuery().gt(queryval);
      //
    } else if (querykey === conditionKeyMap.$gte) {
      myQueryVal = this.cassandraMapperQuery().gte(queryval);
      //
    } else if (querykey === conditionKeyMap.$in) {
      myQueryVal = this.cassandraMapperQuery().in_(queryval);
      //
    } else if (querykey === conditionKeyMap.$lt) {
      myQueryVal = this.cassandraMapperQuery().lt(queryval);
      //
    } else if (querykey === conditionKeyMap.$lte) {
      myQueryVal = this.cassandraMapperQuery().lte(queryval);
      //
    }
    return myQueryVal;
  }

  generateQuery(query: Record<string, any>) {
    if (!(query && typeof query === "object")) {
      throw new Error("Invalid query object config");
    }

    const myQueryObj: Record<string, any> = {};

    Object.entries(query).forEach(([field, valOrQuery]) => {
      if (typeof valOrQuery === "object" && valOrQuery) {
        Object.entries(valOrQuery).forEach(([querykey, queryval]) => {
          if (hasQueryConditionKey(querykey)) {
            if (querykey === conditionKeyMap.$and) {
              if (Array.isArray(queryval)) {
                const andResut: Record<string, any>[] = [];
                for (const keyAndVal of queryval as Record<string, any>[]) {
                  Object.entries(keyAndVal).forEach(([querykey02, queryval02]) => {
                    const result = this.getQueryMapValue({
                      querykey: querykey02,
                      queryval: queryval02,
                    });
                    if (result) {
                      andResut.push(result);
                    }
                  });
                }
                if (andResut?.length === 2) {
                  myQueryObj[field] = this.cassandraMapperQuery().and(andResut[0], andResut[1]);
                } else {
                  throw new Error("Invalid AND query config");
                }
              }
            } else {
              const result = this.getQueryMapValue({ querykey, queryval });
              if (result) {
                myQueryObj[field] = result;
              }
            }
          }
        });
      } else if (
        typeof valOrQuery !== "undefined" &&
        (typeof valOrQuery === "string" || typeof valOrQuery === "number")
      ) {
        myQueryObj[field] = valOrQuery;
      }
    });
    return Object.keys(myQueryObj)?.length ? myQueryObj : null;
  }
}

export const QueryBuilderService = new QueryBuilderServiceBase();

/*
export const queryHooloa: IQueryDefinition<{ id: string; name: string; shortCode: number }> = {
  id: "849954995",
  name: { $eq: "Chris" },
  shortCode: {
    $and: [{ $lte: 700 }, { $gte: 900 }],
  },
};
*/
