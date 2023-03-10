import { Node } from "cc";
import Single from "../common/Single";
import { IColData, IRowData } from "../types";
import { Game } from "../Game";
import AliveRecord from "./AliveRecord";
import Wash from "./Wash";
import TweenUtils from "../common/TweenUtils";
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
  public getDirToNode(form: IColData) {
    return [
      // 上
      this.rows[form.rowZIndex - 1]?.cols?.[form.colZIndex],
      // 下
      this.rows[form.rowZIndex + 1]?.cols?.[form.colZIndex],
      // 左
      this.rows[form.rowZIndex]?.cols?.[form.colZIndex - 1],
      // 右
      this.rows[form.rowZIndex]?.cols?.[form.colZIndex + 1],
    ];
  }

  /**
   * 获取洗牌的4个方向的节点数组
   * @param col
   * @example
   * ```
   * return [col, undefined, undefined, col]
   * ```
   */
  public getDirToWashNode(col: IColData) {
    return [
      // 左上
      this.rows?.[col.rowZIndex - 1]?.cols?.[col.colZIndex - 1],
      // 右上
      this.rows?.[col.rowZIndex - 1]?.cols?.[col.colZIndex + 1],
      // 右下
      this.rows?.[col.rowZIndex + 1]?.cols?.[col.colZIndex + 1],
      // 左下
      this.rows?.[col.rowZIndex + 1]?.cols?.[col.colZIndex - 1],
    ];
  }

  /** 是否死局 */
  public get isDeath() {
    return Reflect.ownKeys(AliveRecord.aliveRecord).length === 0;
  }

  /** 初始化成活记录 */
  public initAliveData() {
    AliveRecord.init(this.rows);
    // 如果一开局便死局，直接洗牌
    if (this.isDeath) {
      Wash.start();
    }
  }

  /**
   * 交换节点
   */
  public swap(to: IColData, form: IColData) {
    let tmp: any;
    // 交换`TableData`的地址
    tmp = this.rows[to.rowZIndex].cols[to.colZIndex];
    this.rows[to.rowZIndex].cols[to.colZIndex] = form;
    this.rows[form.rowZIndex].cols[form.colZIndex] = to;
    // 交换行数
    tmp = to.rowZIndex;
    to.rowZIndex = form.rowZIndex;
    form.rowZIndex = tmp;
    // 交换列数
    tmp = to.colZIndex;
    to.colZIndex = form.colZIndex;
    form.colZIndex = tmp;
    // 交换世界位置
    TweenUtils.swapMove(to, form);
  }
}

export default TableData.instance as TableData;
