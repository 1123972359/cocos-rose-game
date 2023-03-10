import {
  _decorator,
  Component,
  instantiate,
  macro,
  Node,
  Prefab,
  Sprite,
  Vec3,
} from "cc";
import TableData from "./data/TableData";
import { IColData, IRowData } from "./types";
import { Floor } from "./Floor";
import LoadUtils from "./common/LoadUtils";
import Utils from "./common/Utils";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
  @property(Prefab)
  private tablePrefab: Prefab;
  @property(Prefab)
  private floorPrefab: Prefab;
  @property(Prefab)
  private rowPrefab: Prefab;
  /** 行数 */
  private rowCount = 3;
  private rowStepVec3 = new Vec3(50, -86);
  /** 列数 */
  private colCount = 3;
  private colStepVec3 = new Vec3(100, 0);

  start() {
    macro.ENABLE_MULTI_TOUCH = false;
  }

  /** 渲染游戏 */
  public init() {
    this.createTable();
    this.createRow();
    TableData.initAliveData();
  }

  /**
   * 创建表格
   *
   * 1. 根据正北方向为上，棋盘旋转-45°，即上方为西北方向
   * 2. 一行5个floor，最后一行为4个，总共24个floor
   */
  private createTable() {
    TableData.node = instantiate(this.tablePrefab);
    this.node.addChild(TableData.node);
  }

  /** 根据行数创建行 */
  private createRow() {
    let node: Node;
    TableData.rows = new Array(this.rowCount).fill(0).map((_, index) => {
      node = instantiate(this.rowPrefab);
      node.setPosition(
        new Vec3(index * this.rowStepVec3.x, index * this.rowStepVec3.y)
      );
      TableData.node.insertChild(node, index);
      const data: IRowData = {
        node,
        rowZIndex: index,
        cols: this.createFloor(node, index),
      };
      return data;
    });
  }

  /**
   * 创建地板
   * @param rowNode 行节点
   * @param rowZIndex 行索引
   * @param rowData
   *
   * 1. 游戏一开始阶段只有1级与2级
   */
  private createFloor(rowNode: Node, rowZIndex: number): IColData[] {
    // 此处是为了让最后一行缺一个的特殊做法
    const arr = new Array(
      rowZIndex === this.rowCount - 1 ? this.colCount - 1 : this.colCount
    ).fill(0);
    let level: number;
    const cols: IColData[] = arr.map((_, index) => {
      level = this.randomLevel();
      return this.createSeed(rowNode, index, rowZIndex, level).data;
    });
    return cols;
  }

  /** 随机level */
  public randomLevel() {
    return Math.floor(Math.random() * 10) % 2 === 0 ? 1 : 2;
  }

  /**
   * 创建种子节点
   * @param rowNode 行节点
   * @param colZIndex 列索引
   * @param rowZIndex 行索引
   */
  public createSeed(
    rowNode: Node,
    colZIndex: number,
    rowZIndex: number,
    level: number
  ) {
    const node = instantiate(this.floorPrefab);
    node.insertChild(this.renderLevel(level), 0);
    node.setPosition(
      new Vec3(colZIndex * this.colStepVec3.x, colZIndex * this.colStepVec3.y)
    );
    rowNode.insertChild(node, colZIndex);
    const data = {
      node,
      rowZIndex,
      colZIndex,
      level,
      id: Utils.uuid,
    };
    node.getComponent(Floor).data = data;
    return {
      node,
      data,
    };
  }

  /**
   * 渲染level
   * @param node 节点
   * @param level 等级
   */
  public renderLevel(level: number, node: Node = null) {
    if (!node) {
      node = new Node();
      node.name = "level";
    }
    const sprite = node.getComponent(Sprite) ?? node.addComponent(Sprite);
    LoadUtils.loadRes(sprite, `images/level${level}/spriteFrame`);
    return node;
  }

  /**
   * 移除种子节点
   * @deprecated 应该不需要此方法
   *
   * @param colZIndex 列索引
   * @param rowZIndex 行索引
   */
  public removeSeed(colZIndex: number, rowZIndex: number) {
    TableData.rows[rowZIndex].node.removeChild(
      TableData.rows[rowZIndex].cols[colZIndex].node
    );
    TableData.rows[rowZIndex].cols.splice(colZIndex, 1);
  }
}
