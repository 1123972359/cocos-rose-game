import { Node } from "cc";

export interface ITableData {
  node: Node;
  rows: IRowData[];
}

/** 行数据 */
export interface IRowData {
  node: Node;
  rowZIndex: number;
  cols?: IColData[];
}

/** 列数据 */
export interface IColData {
  node: Node;
  rowZIndex: number;
  colZIndex: number;
  level: number;
}
