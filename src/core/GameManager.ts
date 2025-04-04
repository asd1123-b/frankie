import { makeAutoObservable } from 'mobx';

// 玩家資料介面
interface PlayerData {
  name: string;
  actionPoints: number;
  day: number;
  money: number;
  teamName: string;
}

// 遊戲管理器類別
export class GameManager {
  private static instance: GameManager;
  private playerData: PlayerData;
  private readonly MAX_ACTION_POINTS = 10;

  private constructor() {
    makeAutoObservable(this);
    this.playerData = {
      name: '',
      actionPoints: this.MAX_ACTION_POINTS,
      day: 1,
      money: 1000000,
      teamName: ''
    };
  }

  // 單例模式獲取實例
  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  // 初始化玩家資料
  public initializePlayer(name: string, teamName: string): void {
    this.playerData.name = name;
    this.playerData.teamName = teamName;
  }

  // 消耗行動點數
  public useActionPoints(points: number): boolean {
    if (this.playerData.actionPoints >= points) {
      this.playerData.actionPoints -= points;
      return true;
    }
    return false;
  }

  // 進入下一天
  public nextDay(): void {
    this.playerData.day++;
    this.playerData.actionPoints = this.MAX_ACTION_POINTS;
  }

  // 獲取玩家資料
  public getPlayerData(): PlayerData {
    return { ...this.playerData };
  }

  // 更新金錢
  public updateMoney(amount: number): void {
    this.playerData.money += amount;
  }

  // 保存遊戲
  public saveGame(): void {
    localStorage.setItem('gameData', JSON.stringify(this.playerData));
  }

  // 讀取遊戲
  public loadGame(): boolean {
    const savedData = localStorage.getItem('gameData');
    if (savedData) {
      this.playerData = JSON.parse(savedData);
      return true;
    }
    return false;
  }
}