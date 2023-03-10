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
  id: number;
}

/** 滑动方向 */
export enum ISlideDirection {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

/** 洗牌方向 */
export enum IWashDirection {
  LEFT_TOP,
  RIGHT_TOP,
  RIGHT_DOWN,
  LEFT_DOWN,
}
