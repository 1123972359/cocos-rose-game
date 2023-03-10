import Single from "./Single";

/** 普通工具类 */
class Utils extends Single<Utils>() {
  constructor() {
    super();
  }

  private _uuidRecord: Record<number, 1> = {};

  /** 随机id */
  public get uuid() {
    let newUuid = Math.floor(Math.random() * 99999999);
    while (Reflect.has(this._uuidRecord, newUuid)) {
      newUuid = Math.floor(Math.random() * 99999999) * 10;
    }
    Reflect.set(this._uuidRecord, newUuid, 1);
    return newUuid;
  }
}

export default Utils.instance as Utils;
