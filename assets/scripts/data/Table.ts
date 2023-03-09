import { Node } from "cc";
import { App } from "../App";
import Single from "../common/Single";
import { IRowData } from "../types";
/**
 * 表格数据
 */
class Table extends Single<Table>() {
  public appCtrl: App;
  /** 表格节点 */
  public node: Node;
  /** 行数据 */
  public rows: IRowData[];

  constructor() {
    super();
  }
}

export default Table.instance as Table;
