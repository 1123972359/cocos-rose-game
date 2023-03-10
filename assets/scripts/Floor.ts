import {
  _decorator,
  Component,
  EventTouch,
  Node,
  tween,
  Vec2,
  Vec3,
  UIOpacity,
} from "cc";
import { IColData, IRowData } from "./types";
import TableData from "./data/TableData";
import { App } from "./App";
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
    UP: [-157, -134],
    DOWN: [22, 49],
    LEFT: [130, 163],
    RIGHT: [-40, -10],
  };

  start() {
    this.touchNode.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.touchNode.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.touchNode.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  private onTouchStart(e: EventTouch) {
    console.log(`onTouchStart`);
    if (this.isTouch) {
      return;
    }
    // console.log(e.currentTarget);
    this.isTouch = true;
    this.pos.start = e.touch.getLocation();
  }

  private onTouchEnd(e: EventTouch) {
    console.log(`onTouchEnd`);
    if (!this.isTouch) {
      return;
    }
    // console.log(e.currentTarget);
    this.isTouch = false;
    this.pos.end = e.touch.getLocation();
    this.computedTouch(this.pos.start, this.pos.end);
    this.pos = {
      /** 开始落点 */
      start: Vec2.ZERO,
      /** 结束落点 */
      end: Vec2.ZERO,
    };
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
    if (start.equals(end)) {
      return;
    }
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
    if (deg >= this.direction.UP[0] && deg < this.direction.UP[1]) {
      // 向上
      this.handleUp();
      return;
    }
    if (deg >= this.direction.DOWN[0] && deg < this.direction.DOWN[1]) {
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
  private handleUp() {
    console.info(`向上`);
    if (this.data.rowZIndex === 0) {
      return;
    }
    /** 目标节点 */
    const to =
      TableData.rows[this.data.rowZIndex - 1].cols[this.data.colZIndex];
    if (to.level !== this.data.level) {
      this.swap(to);
      return;
    }
    this.levelUp(to);
  }

  /**
   * 移动节点
   * 1. 当前节点与目标节点交换位置(世界坐标系)
   * @param to 目标节点
   */
  private swap(to: IColData) {
    const { moveTo, moveFrom } = this.getTweenMove(to);
    tween(this.node).sequence(moveTo, moveFrom).start();
  }

  /**
   * 当前节点与目标节点合体并升级
   *
   * @param to 目标节点
   */
  private levelUp(to: IColData) {
    const tw = this.getTweenMove(to);
    this.reRenderNode(tw);
    this.renderLevelUp(to, tw);
  }

  /**
   * 获取缓动的数据
   * @param to 目标节点
   */
  private getTweenMove(to: IColData) {
    const formVec3 = new Vec3(
      this.node.worldPosition.x,
      this.node.worldPosition.y
    );
    const toVec3 = new Vec3(to.node.worldPosition.x, to.node.worldPosition.y);
    const moveTo = tween().to(0.25, { worldPosition: toVec3 });
    const moveFrom = tween().to(0.25, { worldPosition: formVec3 });
    return { moveTo, moveFrom, formVec3 };
  }

  /**
   * 渲染升级
   * @param to 目标节点
   * @param tw 缓动数据
   */
  private renderLevelUp(
    to: IColData,
    tw: ReturnType<typeof this.getTweenMove>
  ) {
    // todo !!!踩坑 缓动改变scale会使触摸失效
    // tween(to.node)
    //   .to(0.1, { scale: new Vec3(1, 1.5) })
    //   .to(0.1, { scale: new Vec3(1.5, 1) })
    //   .to(0.1, { scale: new Vec3(1, 1) })
    //   .start();
    tween(this.node).then(tw.moveTo.delay(0.25)).start();
    // 目标节点升级
    to.level++;
    TableData.gameCtrl.renderLevel(to.level, to.node.getChildByName("level"));
  }

  /**
   * 重新渲染
   * @param tw 缓动数据
   */
  private reRenderNode(tw: ReturnType<typeof this.getTweenMove>) {
    tween(this.node.getComponent(UIOpacity))
      .to(0.25, {
        opacity: 0,
      })
      .then(tw.moveFrom)
      .call(() => {
        console.log(`重新渲染`);
        // 当前节点重新渲染
        this.data.level = TableData.gameCtrl.randomLevel();
        TableData.gameCtrl.renderLevel(
          this.data.level,
          this.node.getChildByName("level")
        );
        this.node.worldPosition = tw.formVec3;
        // this.node.scale = new Vec3(0, 0);
        tween(this.node.getComponent(UIOpacity))
          .to(0.25, {
            opacity: 255,
          })
          .start();
      })
      .start();

    // tween(this.node)
    //   .to(0.1, {
    //     scale: new Vec3(1.5, 1.5),
    //   })
    //   .to(0.1, {
    //     scale: new Vec3(1.0, 1.0),
    //   })
    //   .repeat(3)
    //   .start();
  }
}
