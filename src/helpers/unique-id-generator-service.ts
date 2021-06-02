import { v4 as uuidv4 } from "uuid";

class UniqueIdGeneratorServiceBase {
  /** generate uuid prefixed with timestamp. Thus: [FullYear][month][day]-[hour][minuite]-[uuid] */
  getTimeStampGuid() {
    return this.generateDataId();
  }
  getGuid() {
    return uuidv4().toLowerCase();
  }
  generateDataId() {
    const _now = new Date();
    const key = [
      `${_now.getFullYear()}`,
      `${_now.getMonth() + 1}`.padStart(2, "0"),
      `${_now.getDate()}`.padStart(2, "0"),
      "-",
      `${_now.getHours()}`.padStart(2, "0"),
      `${_now.getMinutes()}`.padStart(2, "0"),
      `${_now.getSeconds()}`.padStart(2, "0"),
      "-",
      uuidv4(),
    ];
    return key.join("");
  }
}

export const UniqueIdGeneratorService = new UniqueIdGeneratorServiceBase();
