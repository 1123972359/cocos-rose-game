import { Node } from "cc";
import Single from "../common/Single";
import { IRowData } from "../types";
/**
 * 表格数据
 */
class Table extends Single<Table>() {
  /** 表格节点 */
  public node: Node;
  /** 行数据 */
  public rows: IRowData[];

  constructor() {
    super();
  }
}

export default Table.instance as Table;
