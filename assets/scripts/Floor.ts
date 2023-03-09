import { _decorator, Component, EventTouch, Node, tween, Vec2, Vec3 } from "cc";
import { IColData, IRowData } from "./types";
import Table from "./data/Table";
const { ccclass, property } = _decorator;

@ccclass("Floor")
export class Floor extends Component {
  @property(Node)
  private touchNode: Node;

  private isTouch = false;

  /** 当前的数据 */
  public data: Partial<IColData> = {};

  /** 手指落点 */
  private pos = {
    /** 开始落点 */
    start: Vec2.ZERO,
    /** 结束落点 */
    end: Vec2.ZERO,
  };

  /**
   * 根据欧拉角得出方向
   * 1. 可以设置一些误差
   */
  private direction = {
    TOP: [-157, -134],
    BOTTOM: [22, 49],
    LEFT: [130, 163],
    RIGHT: [-40, -10],
  };

  start() {
    this.touchNode.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.touchNode.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.touchNode.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  private onTouchStart(e: EventTouch) {
    if (this.isTouch) {
      return;
    }
    this.isTouch = true;
    this.pos.start = e.touch.getLocation();
  }

  private onTouchEnd(e: EventTouch) {
    if (!this.isTouch) {
      return;
    }
    this.isTouch = false;
    this.pos.end = e.touch.getLocation();
    this.computedTouch(this.pos.start, this.pos.end);
  }

  /**
   * 触摸计算
   * @param start 触摸开始的位置
   * @param end 触摸结束的位置
   *
   * 1. 计算是否触摸滑动超过临界点
   * 2. 根据二点直接判断出滑动方向
   */
  private computedTouch(start: Vec2, end: Vec2) {
    const dir = end.subtract(start).normalize();
    /** 根据朝向计算出夹角弧度 */
    const angle = dir.signAngle(new Vec2(1, 0));
    /** 将弧度转换为欧拉角 */
    const deg = (angle / Math.PI) * 180;
    this.judgeDirection(deg);
  }

  /**
   * 判断方向
   * @param deg 角度
   */
  private judgeDirection(deg: number) {
    if (deg >= this.direction.TOP[0] && deg < this.direction.TOP[1]) {
      // 向上
      this.handleTop();
      return;
    }
    if (deg >= this.direction.BOTTOM[0] && deg < this.direction.BOTTOM[1]) {
      // 向下
      console.info(`向下`);
      return;
    }
    if (deg >= this.direction.LEFT[0] && deg < this.direction.LEFT[1]) {
      // 向左
      console.info(`向左`);
      return;
    }
    if (deg >= this.direction.RIGHT[0] && deg < this.direction.RIGHT[1]) {
      // 向右
      console.info(`向右`);
      return;
    }
  }

  /** 处理向上滑 */
  private handleTop() {
    console.info(`向上`);
    if (this.data.rowZIndex === 0) {
      return;
    }
    /** 目标节点 */
    const to = Table.rows[this.data.rowZIndex - 1].cols[this.data.colZIndex];
    if (to.level !== this.data.level) {
      this.swap(to);
      return;
    }
    this.fit();
  }

  /**
   * 交换节点的动画，并不真的交换
   *
   * 1. 当前节点与目标节点交换位置(世界坐标系)
   * @param to 目标节点
   */
  private swap(to: IColData) {
    const formVec3 = new Vec3(
      this.node.worldPosition.x,
      this.node.worldPosition.y
    );
    const toVec3 = new Vec3(to.node.worldPosition.x, to.node.worldPosition.y);
    const moveTo = tween().to(0.5, { worldPosition: toVec3 });
    const moveFrom = tween().to(0.5, { worldPosition: formVec3 });
    tween(this.node).sequence(moveTo, moveFrom).start();
  }

  /**
   * 当前节点与目标节点合体并升级
   */
  private fit() {}
}
