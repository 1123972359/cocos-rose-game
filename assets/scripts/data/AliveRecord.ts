import Single from "../common/Single";
import { IColData, IRowData, ISlideDirection } from "../types";
import TableData from "./TableData";

/** 成活记录类 */
class AliveRecord extends Single<AliveRecord>() {
  constructor() {
    super();
  }

  private dirList = [
    ISlideDirection.UP,
    ISlideDirection.DOWN,
    ISlideDirection.LEFT,
    ISlideDirection.RIGHT,
  ];

  /**
   * 成活记录
   * @description 相邻有可合成的floor
   */
  public aliveRecord: Record<number, IColData> = {};

  public get(col: IColData) {
    return Reflect.get(this.aliveRecord, col.id);
  }

  public has(col: IColData) {
    return Reflect.has(this.aliveRecord, col.id);
  }

  public set(col: IColData) {
    Reflect.set(this.aliveRecord, col.id, col);
  }

  public delete(col: IColData) {
    Reflect.deleteProperty(this.aliveRecord, col.id);
  }

  /** 清空成活记录 */
  public clear() {
    this.aliveRecord = {};
  }

  /**
   * 初始化成活记录
   * @description 每个floor的相邻节点可合成，即可成活
   */
  public init(rows: IRowData[]) {
    this.clear();
    rows.forEach((row) => {
      this.rowForAlive(row);
    });
    console.log(
      `refreshAlive init ===> `,
      Reflect.ownKeys(this.aliveRecord).length,
      Reflect.ownKeys(this.aliveRecord).map((item) => item as any)
    );
  }

  /** 循环一行中所有的列 */
  private rowForAlive(row: IRowData) {
    for (const col of row.cols) {
      if (this.get(col)) {
        // 如果已经成活，不需要再进入记录, 跳过
        continue;
      }
      this.colForAlive(col);
    }
  }

  /** 对单个col判断是否成活 */
  private colForAlive(col: IColData) {
    let findCol: IColData;
    this.delete(col);
    for (const dir of this.dirList) {
      findCol = TableData.getDirToNode(col, dir);
      if (findCol?.level === col.level) {
        // 上下左右中有一个活，直接退出循环
        this.set(col);
        this.set(findCol);
        return;
      }
    }
  }

  /**
   * 刷新每个节点的成活记录
   * @param args
   */
  public refreshAlive(...args: IColData[]) {
    let dirColArr: IColData[] = [];
    args.forEach((col) => {
      // 1. 重新刷新两个节点的成活记录
      this.set(col);
      this.colForAlive(col);
      // 2. 找到两个节点的上下左右节点
      dirColArr = this.dirList.map((dir) => {
        return TableData.getDirToNode(col, dir);
      });
      // =============================================
      // 3. 上下左右中的每个col
      // ---------------------------------------------
      // 3.1 如果col本身有成活记录
      // 3.1.1 col与当前节点可合成，那无需更改
      // 3.1.2 col与当前节点不可合成，就要`colForAlive`
      //----------------------------------------------
      // 3.2 如果col本身没有成活记录
      // 3.2.1 col与当前节点可合成，那直接记录
      // 3.2.2 col与当前节点不可合成, 跳过
      // =============================================
      for (const dirCol of dirColArr) {
        if (dirCol) {
          // 3.1
          if (this.has(dirCol)) {
            if (dirCol.level === col.level) {
              // 3.1.1
              continue;
            } else {
              // 3.1.2
              this.colForAlive(dirCol);
              continue;
            }
          }
          // 3.2
          else if (dirCol.level === col.level) {
            // 3.2.1
            this.set(dirCol);
            continue;
          }
          // 3.2.2
          continue;
        }
      }
    });
  }
}

export default AliveRecord.instance as AliveRecord;
