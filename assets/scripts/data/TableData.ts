import { Node } from "cc";
import Single from "../common/Single";
import { IRowData } from "../types";
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
}

export default TableData.instance as TableData;
