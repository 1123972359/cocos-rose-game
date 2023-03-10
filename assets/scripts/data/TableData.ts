import { Node } from "cc";
import Single from "../common/Single";
import { IColData, IRowData, ISlideDirection } from "../types";
import { Game } from "../Game";
/**
 * 表格数据
 */
class TableData extends Single<TableData>() {
  public gameCtrl: Game;
  /** 表格节点 */
  public node: Node;
  /** 行数据 */
  public rows: IRowData[];

  constructor() {
    super();
  }

  /**
   * 获取节点在某个方向上面的相邻节点
   *
   * @param form 当前节点
   * @param dir 方向
   */
  public getDirToNode(form: IColData, dir: ISlideDirection): IColData {
    switch (dir) {
      case ISlideDirection.UP:
        return this.rows[form.rowZIndex - 1].cols[form.colZIndex];
      case ISlideDirection.DOWN:
        return this.rows[form.rowZIndex + 1].cols[form.colZIndex];
      case ISlideDirection.LEFT:
        return this.rows[form.rowZIndex].cols[form.colZIndex - 1];
      case ISlideDirection.RIGHT:
        return this.rows[form.rowZIndex].cols[form.colZIndex + 1];
      default:
        break;
    }
  }
}

export default TableData.instance as TableData;
