import { Node, UIOpacity, Vec3, tween } from "cc";
import { IColData } from "../types";
import Single from "./Single";

/**
 * 缓动类
 */
class TweenUtils extends Single<TweenUtils>() {
  constructor() {
    super();
  }

  /**
   * 获取移动的数据
   * @param to 目标节点
   * @param form 当前节点
   */
  public tweenMove(to: IColData, form: IColData) {
    const formVec3 = new Vec3(
      form.node.worldPosition.x,
      form.node.worldPosition.y
    );
    const toVec3 = new Vec3(to.node.worldPosition.x, to.node.worldPosition.y);
    const moveTo = tween().to(0.2, { worldPosition: toVec3 });
    const moveFrom = tween().to(0.2, { worldPosition: formVec3 });
    return { moveTo, moveFrom, formVec3 };
  }

  /**
   * 震动，缩放
   * @param to
   * @param scale 缩放至
   * @param duration 持续时间/秒
   */
  public shakeScale(to: IColData, scale = 1.5, duration = 0.1) {
    return tween(to.node)
      .to(duration, { scale: new Vec3(1, scale, 1) })
      .to(duration, { scale: new Vec3(scale, 1, 1) })
      .to(duration, { scale: new Vec3(1, 1, 1) })
      .start();
  }

  /**
   * 透明度
   * @param node 节点
   * @param opacity 透明度 [0, 255]
   * @param duration 持续时间/秒
   */
  public opacity(node: Node, opacity = 255, duration = 0.25) {
    return tween(node.getComponent(UIOpacity))
      .to(duration, {
        opacity,
      })
      .start();
  }

  /** 原地抖动 */
  public shakePosition(node: Node) {
    const diff = 6;
    const formVec3 = new Vec3(node.worldPosition.x, node.worldPosition.y);
    tween(node)
      .sequence(
        tween().to(0.1, {
          worldPosition: new Vec3(formVec3.x + diff, formVec3.y - diff),
        }),
        tween().to(0.1, {
          worldPosition: new Vec3(formVec3.x - diff, formVec3.y + diff),
        })
      )
      .repeat(2)
      .to(0.1, {
        worldPosition: formVec3,
      })
      .start();
  }
}

export default TweenUtils.instance as TweenUtils;
