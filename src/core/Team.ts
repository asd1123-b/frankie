import { makeAutoObservable } from 'mobx';
import { Player, Position } from './Player';

// 球隊能力評價
interface TeamRating {
  offense: number;      // 攻擊力
  defense: number;      // 防守力
  pitching: number;     // 投手陣容
  teamwork: number;     // 團隊協作
  morale: number;       // 士氣
}

// 球隊類別
export class Team {
  private name: string;
  private players: Map<string, Player>;
  private lineup: string[];     // 先發陣容ID列表
  private rating: TeamRating;
  private funds: number;
  private fanSupport: number;   // 球迷支持度（0-100）

  constructor(name: string) {
    makeAutoObservable(this);
    
    this.name = name;
    this.players = new Map();
    this.lineup = [];
    this.rating = {
      offense: 50,
      defense: 50,
      pitching: 50,
      teamwork: 50,
      morale: 50
    };
    this.funds = 1000000;
    this.fanSupport = 50;
  }

  // 添加球員
  public addPlayer(player: Player): void {
    const playerData = player.getPlayerData();
    this.players.set(playerData.id, player);
    this.updateTeamRating();
  }

  // 移除球員
  public removePlayer(playerId: string): boolean {
    const removed = this.players.delete(playerId);
    if (removed) {
      this.lineup = this.lineup.filter(id => id !== playerId);
      this.updateTeamRating();
    }
    return removed;
  }

  // 設置先發陣容
  public setLineup(playerIds: string[]): boolean {
    // 檢查陣容是否合法（需要包含所有必要位置）
    const positions = new Set(playerIds.map(id => {
      const player = this.players.get(id);
      return player?.getPlayerData().position;
    }));

    const requiredPositions = [
      Position.Pitcher,
      Position.Catcher,
      Position.FirstBase,
      Position.SecondBase,
      Position.ThirdBase,
      Position.ShortStop,
      Position.LeftField,
      Position.CenterField,
      Position.RightField
    ];

    const hasAllPositions = requiredPositions.every(pos => positions.has(pos));
    if (!hasAllPositions) return false;

    this.lineup = playerIds;
    return true;
  }

  // 更新球隊能力評價
  private updateTeamRating(): void {
    let totalOffense = 0;
    let totalDefense = 0;
    let totalPitching = 0;
    let totalMotivation = 0;

    this.players.forEach(player => {
      const data = player.getPlayerData();
      totalOffense += (data.stats.batting + data.stats.power) / 2;
      totalDefense += (data.stats.fielding + data.stats.throwing) / 2;
      if (data.position === Position.Pitcher) {
        totalPitching += (data.stats.pitching! + data.stats.control!) / 2;
      }
      totalMotivation += data.condition.motivation;
    });

    const playerCount = this.players.size;
    if (playerCount > 0) {
      this.rating.offense = Math.round(totalOffense / playerCount);
      this.rating.defense = Math.round(totalDefense / playerCount);
      this.rating.pitching = Math.round(totalPitching / this.getPitcherCount());
      this.rating.morale = Math.round(totalMotivation / playerCount);
      
      // 團隊協作根據陣容穩定性和球員狀態計算
      this.rating.teamwork = Math.round(
        (this.rating.morale + this.getLineupStability()) / 2
      );
    }
  }

  // 獲取投手數量
  private getPitcherCount(): number {
    let count = 0;
    this.players.forEach(player => {
      if (player.getPlayerData().position === Position.Pitcher) count++;
    });
    return Math.max(1, count);
  }

  // 計算陣容穩定性（基於先發陣容的持續時間）
  private getLineupStability(): number {
    // 這裡可以實現更複雜的計算邏輯
    return this.lineup.length === 9 ? 75 : 50;
  }

  // 更新資金
  public updateFunds(amount: number): void {
    this.funds += amount;
  }

  // 更新球迷支持度
  public updateFanSupport(change: number): void {
    this.fanSupport = Math.max(0, Math.min(100, this.fanSupport + change));
  }

  // 獲取球隊資料
  public getTeamData() {
    return {
      name: this.name,
      players: Array.from(this.players.values()).map(p => p.getPlayerData()),
      lineup: this.lineup,
      rating: { ...this.rating },
      funds: this.funds,
      fanSupport: this.fanSupport
    };
  }

  // 獲取特定位置的所有球員
  public getPlayersByPosition(position: Position): Player[] {
    return Array.from(this.players.values())
      .filter(player => player.getPlayerData().position === position);
  }

  // 進行團隊訓練
  public conductTeamTraining(): void {
    this.players.forEach(player => {
      // 隨機選擇一個能力進行提升
      const stats = ['batting', 'power', 'running', 'throwing', 'fielding'];
      const randomStat = stats[Math.floor(Math.random() * stats.length)] as keyof typeof player.getPlayerData().stats;
      player.train(randomStat);
    });
    
    // 提升團隊協作
    this.rating.teamwork = Math.min(100, this.rating.teamwork + 2);
    // 更新球隊整體評價
    this.updateTeamRating();
  }
}