import { Team } from './Team';
import { Player, Position } from './Player';

// 比賽結果介面
interface MatchResult {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  innings: InningResult[];
  mvp: string;
  highlights: string[];
}

// 局次結果介面
interface InningResult {
  inning: number;
  topScore: number;
  bottomScore: number;
  events: string[];
}

// 比賽模擬器類別
export class MatchSimulator {
  private homeTeam: Team;
  private awayTeam: Team;
  private currentInning: number;
  private outs: number;
  private bases: boolean[];
  private homeScore: number;
  private awayScore: number;
  private inningResults: InningResult[];
  private highlights: string[];
  private playerPerformance: Map<string, PlayerPerformance>;

  constructor(homeTeam: Team, awayTeam: Team) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.currentInning = 1;
    this.outs = 0;
    this.bases = [false, false, false]; // 一、二、三壘
    this.homeScore = 0;
    this.awayScore = 0;
    this.inningResults = [];
    this.highlights = [];
    this.playerPerformance = new Map();
  }

  // 開始比賽模擬
  public simulateMatch(): MatchResult {
    let isTopInning = true;
    let gameOver = false;

    while (!gameOver) {
      this.simulateHalfInning(isTopInning);
      
      if (isTopInning) {
        isTopInning = false;
      } else {
        // 檢查是否需要延長賽
        if (this.currentInning >= 9) {
          if (this.homeScore !== this.awayScore) {
            gameOver = true;
          } else {
            this.currentInning++;
            isTopInning = true;
          }
        } else {
          this.currentInning++;
          isTopInning = true;
        }
      }
    }

    return this.generateMatchResult();
  }

  // 模擬半局比賽
  private simulateHalfInning(isTopInning: boolean): void {
    const battingTeam = isTopInning ? this.awayTeam : this.homeTeam;
    const pitchingTeam = isTopInning ? this.homeTeam : this.awayTeam;
    
    this.outs = 0;
    this.bases = [false, false, false];
    let inningEvents: string[] = [];

    while (this.outs < 3) {
      const result = this.simulateAtBat(battingTeam, pitchingTeam);
      inningEvents.push(result);
    }

    this.inningResults.push({
      inning: this.currentInning,
      topScore: isTopInning ? this.awayScore : this.homeScore,
      bottomScore: isTopInning ? this.homeScore : this.awayScore,
      events: inningEvents
    });
  }

  // 模擬打席
  private simulateAtBat(battingTeam: Team, pitchingTeam: Team): string {
    const batter = this.getNextBatter(battingTeam);
    const pitcher = this.getCurrentPitcher(pitchingTeam);
    
    const batterData = batter.getPlayerData();
    const pitcherData = pitcher.getPlayerData();

    // 計算打擊結果
    const hitChance = (
      batterData.stats.batting * 0.4 +
      batterData.stats.power * 0.3 +
      (100 - pitcherData.stats.pitching!) * 0.2 +
      (100 - pitcherData.stats.control!) * 0.1
    ) / 100;

    const random = Math.random();
    let result = '';

    if (random < hitChance * 0.1) {
      // 全壘打
      result = this.processHomeRun(batter);
    } else if (random < hitChance * 0.3) {
      // 安打
      result = this.processHit(batter);
    } else if (random < hitChance * 0.4) {
      // 四壞球
      result = this.processWalk(batter);
    } else {
      // 出局
      result = this.processOut(batter);
    }

    return result;
  }

  // 處理全壘打
  private processHomeRun(batter: Player): string {
    const batterData = batter.getPlayerData();
    let runsScored = 1;
    
    // 計算壘上跑者
    runsScored += this.bases.filter(base => base).length;
    this.bases = [false, false, false];

    // 更新比分
    if (this.currentInning % 2 === 1) {
      this.awayScore += runsScored;
    } else {
      this.homeScore += runsScored;
    }

    this.updatePlayerPerformance(batterData.id, 'homeRun');
    return `${batterData.name} 擊出全壘打！得到 ${runsScored} 分！`;
  }

  // 處理安打
  private processHit(batter: Player): string {
    const batterData = batter.getPlayerData();
    let runsScored = 0;

    // 根據打者能力決定安打類型
    const hitType = Math.random() < batterData.stats.power / 100 ? '二壘安打' : '一壘安打';
    
    if (hitType === '二壘安打') {
      // 處理二壘安打
      runsScored = this.processDoubleHit();
    } else {
      // 處理一壘安打
      runsScored = this.processSingleHit();
    }

    this.updatePlayerPerformance(batterData.id, 'hit');
    return `${batterData.name} 擊出${hitType}！${runsScored > 0 ? `得到 ${runsScored} 分！` : ''}`;
  }

  // 處理四壞球
  private processWalk(batter: Player): string {
    const batterData = batter.getPlayerData();
    let runsScored = 0;

    // 處理壘包推進
    if (this.bases[0] && this.bases[1] && this.bases[2]) {
      runsScored = 1;
    }
    
    // 更新壘包狀態
    for (let i = 2; i >= 0; i--) {
      if (i === 0 || this.bases[i - 1]) {
        this.bases[i] = true;
      }
    }

    // 更新比分
    if (this.currentInning % 2 === 1) {
      this.awayScore += runsScored;
    } else {
      this.homeScore += runsScored;
    }

    this.updatePlayerPerformance(batterData.id, 'walk');
    return `${batterData.name} 獲得四壞球！${runsScored > 0 ? '推進一分！' : ''}`;
  }

  // 處理出局
  private processOut(batter: Player): string {
    const batterData = batter.getPlayerData();
    this.outs++;
    
    // 隨機決定出局方式
    const outTypes = ['三振', '滾地球', '飛球'];
    const outType = outTypes[Math.floor(Math.random() * outTypes.length)];

    this.updatePlayerPerformance(batterData.id, 'out');
    return `${batterData.name} ${outType}出局！`;
  }

  // 更新球員表現記錄
  private updatePlayerPerformance(playerId: string, result: string): void {
    if (!this.playerPerformance.has(playerId)) {
      this.playerPerformance.set(playerId, {
        atBats: 0,
        hits: 0,
        homeRuns: 0,
        walks: 0
      });
    }

    const performance = this.playerPerformance.get(playerId)!;
    switch (result) {
      case 'homeRun':
        performance.homeRuns++;
        performance.hits++;
        performance.atBats++;
        break;
      case 'hit':
        performance.hits++;
        performance.atBats++;
        break;
      case 'walk':
        performance.walks++;
        break;
      case 'out':
        performance.atBats++;
        break;
    }
  }

  // 處理二壘安打
  private processDoubleHit(): number {
    let runsScored = 0;
    
    // 計算進壘情況
    if (this.bases[2]) runsScored++;
    if (this.bases[1]) runsScored++;
    if (this.bases[0]) this.bases[2] = true;
    
    this.bases[1] = true;
    this.bases[0] = false;

    // 更新比分
    if (this.currentInning % 2 === 1) {
      this.awayScore += runsScored;
    } else {
      this.homeScore += runsScored;
    }

    return runsScored;
  }

  // 處理一壘安打
  private processSingleHit(): number {
    let runsScored = 0;
    
    // 計算進壘情況
    if (this.bases[2]) {
      runsScored++;
      this.bases[2] = false;
    }
    if (this.bases[1]) {
      this.bases[2] = true;
    }
    if (this.bases[0]) {
      this.bases[1] = true;
    }
    this.bases[0] = true;

    // 更新比分
    if (this.currentInning % 2 === 1) {
      this.awayScore += runsScored;
    } else {
      this.homeScore += runsScored;
    }

    return runsScored;
  }

  // 獲取下一位打者
  private getNextBatter(team: Team): Player {
    const lineup = team.getTeamData().lineup;
    // 這裡需要實現打序輪轉的邏輯
    return team.getPlayersByPosition(Position.Pitcher)[0]; // 臨時返回投手
  }

  // 獲取當前投手
  private getCurrentPitcher(team: Team): Player {
    return team.getPlayersByPosition(Position.Pitcher)[0];
  }

  // 生成比賽結果
  private generateMatchResult(): MatchResult {
    // 決定MVP
    const mvpId = this.determineMVP();
    const mvpPlayer = this.homeTeam.getTeamData().players.find(p => p.id === mvpId) ||
                     this.awayTeam.getTeamData().players.find(p => p.id === mvpId);

    return {
      homeTeam: this.homeTeam.getTeamData().name,
      awayTeam: this.awayTeam.getTeamData().name,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      innings: this.inningResults,
      mvp: mvpPlayer?.name || '',
      highlights: this.highlights
    };
  }

  // 決定MVP
  private determineMVP(): string {
    let bestPerformance = {
      playerId: '',
      score: 0
    };

    this.playerPerformance.forEach((performance, playerId) => {
      const score = performance.hits * 2 + performance.homeRuns * 5 + performance.walks;
      if (score > bestPerformance.score) {
        bestPerformance = {
          playerId,
          score
        };
      }
    });

    return bestPerformance.playerId;
  }
}

// 球員表現記錄介面
interface PlayerPerformance {
  atBats: number;     // 打數
  hits: number;       // 安打數
  homeRuns: number;   // 全壘打數
  walks: number;      // 四壞球數
}