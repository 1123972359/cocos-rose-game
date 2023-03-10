import Single from "../common/Single";
import { IColData, IRowData } from "../types";
import TableData from "./TableData";

/** 洗牌类 */
class Wash extends Single<Wash>() {
  constructor() {
    super();
  }

  /** 已经洗过的节点，不要再洗了 */
  private _hasBeenWashRecord: Record<number, 1> = {};

  /**
   * 开始洗牌
   *
   * 1. 遍历table的数据
   * 2. 判断节点的左上、右上、右下、左下是否可以合成
   * 3. 然后进行随机地在节点的上下左右中替换节点
   */
  public start() {
    this._hasBeenWashRecord = {};
    TableData.rows.forEach((row) => {
      this.washForRow(row);
    });
  }

  private washForRow(row: IRowData) {
    row.cols.forEach((col) => {
      this.washForCol(col);
    });
  }

  private washForCol(col: IColData) {
    /** 洗牌方向有节点并且可合成的数据 */
    const dirArr = TableData.getDirToWashNode(col).filter(
      (item) => item && item.level === col.level
    );
    if (dirArr.length > 0) {
      const to = dirArr[0];
      const formArr = TableData.getDirToNode(col).filter(
        (item) => item && item.level !== col.level
      );
      let form: IColData;
      while (formArr.length > 0) {
        // 将身旁的节点与可合成的节点交换，达成洗牌效果
        form = formArr.shift();
        if (!Reflect.has(this._hasBeenWashRecord, form.id)) {
          Reflect.set(this._hasBeenWashRecord, to.id, 1);
          Reflect.set(this._hasBeenWashRecord, form.id, 1);
          TableData.swap(to, form);
          return;
        }
      }
    }
  }
}

export default Wash.instance as Wash;
