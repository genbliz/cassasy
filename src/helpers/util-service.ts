class UtilServiceBase {
  groupOneBy<T>(dataList: T[], fn: (dt: T) => string | number) {
    const aggr: Record<string, T> = {};
    if (dataList?.length) {
      dataList.forEach((data) => {
        const groupId = fn(data);
        if (aggr[groupId] === undefined) {
          aggr[groupId] = data;
        }
      });
    }
    return aggr;
  }

  groupBy<T>(dataList: T[], fn: (dt: T) => string | number) {
    const aggr: Record<string, T[]> = {};
    if (dataList?.length) {
      dataList.forEach((data) => {
        const groupId = fn(data);
        if (!aggr[groupId]) {
          aggr[groupId] = [];
        }
        aggr[groupId].push(data);
      });
    }
    return aggr;
  }
}

export const UtilService = new UtilServiceBase();
