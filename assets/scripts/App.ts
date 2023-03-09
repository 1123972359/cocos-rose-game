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
import Table from "./data/Table";
import { IColData, IRowData } from "./types";
import LoadUtils from "./common/LoadUtils";
import { Floor } from "./Floor";
const { ccclass, property } = _decorator;

@ccclass("App")
export class App extends Component {
  @property(Node)
  private gameAreaNode: Node;
  @property(Prefab)
  private tablePrefab: Prefab;
  @property(Prefab)
  private floorPrefab: Prefab;
  @property(Prefab)
  private rowPrefab: Prefab;

  /** 列数 */
  private colCount = 5;
  private colStepVec3 = new Vec3(100, 4);
  /** 行数 */
  private rowCount = 5;
  private rowStepVec3 = new Vec3(43, -93);

  start() {
    macro.ENABLE_MULTI_TOUCH = false;
    this.initGame();
  }

  /** 渲染游戏 */
  private initGame() {
    this.createTable();
    this.createRow();
  }

  /**
   * 创建表格
   *
   * 1. 根据正北方向为上，棋盘旋转-45°，即上方为西北方向
   * 2. 一行5个floor，最后一行为4个，总共24个floor
   */
  private createTable() {
    Table.node = instantiate(this.tablePrefab);
    this.gameAreaNode.addChild(Table.node);
  }

  /** 根据行数创建行 */
  private createRow() {
    let node: Node;
    Table.rows = new Array(this.rowCount).fill(0).map((_, index) => {
      node = instantiate(this.rowPrefab);
      node.setPosition(
        new Vec3(index * this.rowStepVec3.x, index * this.rowStepVec3.y)
      );
      Table.node.insertChild(node, index);
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
    let node: Node;
    let level: number;
    const arr = new Array(
      rowZIndex === this.rowCount - 1 ? this.colCount - 1 : this.colCount
    ).fill(0);
    const cols: IColData[] = arr.map((_, index) => {
      level = Math.floor(Math.random() * 10) % 2 === 0 ? 1 : 2;
      node = instantiate(this.floorPrefab);
      node.insertChild(this.createLevel(level), 0);
      node.setPosition(
        new Vec3(index * this.colStepVec3.x, index * this.colStepVec3.y)
      );
      rowNode.insertChild(node, index);
      const data = {
        node,
        rowZIndex,
        colZIndex: index,
        level,
      };
      node.getComponent(Floor).data = data;
      return data;
    });
    return cols;
  }

  /**
   * 创建level
   * @param level 等级
   */
  private createLevel(level: number) {
    const node = new Node();
    const sprite = node.addComponent(Sprite);
    LoadUtils.loadRes(sprite, `images/level${level}/spriteFrame`);
    return node;
  }
}
