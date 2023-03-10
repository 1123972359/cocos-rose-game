import { _decorator, Component } from "cc";
import { Game } from "./Game";
import TableData from "./data/TableData";
const { ccclass, property } = _decorator;

@ccclass("App")
export class App extends Component {
  @property({
    type: Game,
  })
  private gameCtrl: Game;

  protected start(): void {
    TableData.gameCtrl = this.gameCtrl;
    this.gameCtrl.init();
  }
}
