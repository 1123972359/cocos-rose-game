import { Sprite, SpriteFrame, resources } from "cc";

/** 加载资源类 */
class LoadUtils {
  /**
   * 加载本地资源图片
   * @param sprite Sprite
   * @param path resources下`SpriteFrame`的路径
   */
  static loadRes(sprite: Sprite, path: string) {
    resources.load(path, SpriteFrame, (err: any, spriteFrame: SpriteFrame) => {
      sprite.spriteFrame = spriteFrame;
    });
  }
}

export default LoadUtils;
