import { _decorator, Component, EventTouch, Node, tween, Vec2, Vec3 } from "cc";
import { IColData, ISlideDirection } from "./types";
import TableData from "./data/TableData";
import TweenUtils from "./common/TweenUtils";
import AliveRecord from "./data/AliveRecord";
const { ccclass, property } = _decorator;

@ccclass("Floor")
export class Floor extends Component {
  @property(Node)
  private touchNode: Node;

  private isTouch = false;

  private zIndex = 0;

  /** 当前的数据 */
  public data: IColData = {
    node: null,
    rowZIndex: -1,
    colZIndex: -1,
    level: -1,
    id: -1,
  };

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
    this.zIndex = TableData.rows.length;
    this.touchNode.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.touchNode.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.touchNode.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  private onTouchStart(e: EventTouch) {
    console.log(`onTouchStart`, this.data.id);
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
    // 保证触摸的层级高
    this.data.node.parent.setSiblingIndex(++this.zIndex);
    this.data.node.setSiblingIndex(++this.zIndex);
    this.judgeDirection(deg);
  }

  /**
   * 判断方向
   * @param deg 角度
   */
  private judgeDirection(deg: number) {
    let to: IColData = null;
    if (deg >= this.direction.UP[0] && deg < this.direction.UP[1]) {
      // 向上
      to = TableData.getDirToNode(this.data, ISlideDirection.UP);
    } else if (deg >= this.direction.DOWN[0] && deg < this.direction.DOWN[1]) {
      // 向下
      to = TableData.getDirToNode(this.data, ISlideDirection.DOWN);
    } else if (deg >= this.direction.LEFT[0] && deg < this.direction.LEFT[1]) {
      // 向左
      to = TableData.getDirToNode(this.data, ISlideDirection.LEFT);
    } else if (
      deg >= this.direction.RIGHT[0] &&
      deg < this.direction.RIGHT[1]
    ) {
      // 向右
      to = TableData.getDirToNode(this.data, ISlideDirection.RIGHT);
    }
    this.judgeSwapOrLevelUp(to);
  }

  /**
   * 判断是否升级合并节点
   * @param to IColData
   */
  private judgeSwapOrLevelUp(to: IColData) {
    if (!to) {
      this.canNotMove();
      return;
    } else if (to.level !== this.data.level) {
      this.swap(to);
      return;
    }
    this.levelUp(to);
    if (TableData.isDeath) {
      // 死局
      console.log(`死局`, TableData.isDeath);
    }
  }

  private canNotMove() {
    TweenUtils.shakePosition(this.data.node);
  }

  /**
   * 移动节点
   * 1. 当前节点与目标节点交换位置(世界坐标系)
   * @param to 目标节点
   */
  private swap(to: IColData) {
    const { moveTo, moveFrom } = TweenUtils.tweenMove(to, this.data);
    tween(this.node).sequence(moveTo, moveFrom).start();
  }

  /**
   * 当前节点与目标节点合体并升级
   *
   * @param to 目标节点
   */
  private levelUp(to: IColData) {
    const tw = TweenUtils.tweenMove(to, this.data);
    this.reRenderNode(tw);
    this.renderLevelUp(to);
    // to 和 this.data 需要重置成活数据
    AliveRecord.refreshAlive(to, this.data);
  }

  /**
   * 渲染升级
   * @param to 目标节点
   */
  private renderLevelUp(to: IColData) {
    TweenUtils.shakeScale(to);
    to.level++;
    TableData.gameCtrl.renderLevel(to.level, to.node.getChildByName("level"));
  }

  /**
   * 重新渲染
   * @param tw 缓动数据
   */
  private reRenderNode(tw: ReturnType<typeof TweenUtils.tweenMove>) {
    this.data.level = TableData.gameCtrl.randomLevel();
    tween(this.node).then(tw.moveTo).start();

    TweenUtils.opacity(this.node, 0)
      .then(tw.moveFrom)
      .call(() => {
        // 当前节点重新渲染
        TableData.gameCtrl.renderLevel(
          this.data.level,
          this.node.getChildByName("level")
        );
        this.node.worldPosition = tw.formVec3;
        TweenUtils.opacity(this.node, 255);
        TweenUtils.shakeScale(this.data, 1.5, 0.1);
      })
      .start();
    TweenUtils.shakeScale(this.data, 0.25);
  }
}
