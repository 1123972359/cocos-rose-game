/** 单例 */
function Single<E>() {
  class S {
    private static _instance: E = null;
    protected constructor() {}

    static get instance() {
      if (!this._instance) {
        return new this() as E;
      }
      return this._instance;
    }
  }

  return S;
}

export default Single;
