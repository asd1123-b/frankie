import { makeAutoObservable } from 'mobx';
import { Player } from './Player';
import { Team } from './Team';
import { GameManager } from './GameManager';

// 事件類型枚舉
enum EventType {
  Story = '劇情',
  Random = '隨機',
  Training = '訓練',
  Match = '比賽',
  Bond = '羈絆'
}

// 事件介面
interface GameEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  conditions: EventCondition[];
  choices: EventChoice[];
  triggered: boolean;
}

// 事件條件介面
interface EventCondition {
  type: 'day' | 'money' | 'playerStat' | 'teamRating' | 'bond';
  target: string;
  value: number;
  operator: '>' | '<' | '==' | '>=' | '<=';
}

// 事件選項介面
interface EventChoice {
  text: string;
  effects: EventEffect[];
}

// 事件效果介面
interface EventEffect {
  type: 'money' | 'playerStat' | 'teamRating' | 'bond' | 'motivation';
  target: string;
  value: number;
}

// 羈絆關係介面
interface BondRelation {
  player1Id: string;
  player2Id: string;
  level: number;      // 羈絆等級（1-5）
  events: string[];   // 已觸發的羈絆事件ID
}

// 事件管理器類別
export class EventManager {
  private static instance: EventManager;
  private events: Map<string, GameEvent>;
  private bonds: Map<string, BondRelation>;
  private triggeredEvents: Set<string>;

  private constructor() {
    makeAutoObservable(this);
    this.events = new Map();
    this.bonds = new Map();
    this.triggeredEvents = new Set();
    this.initializeEvents();
  }

  // 獲取實例
  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  // 初始化事件庫
  private initializeEvents(): void {
    // 添加基礎劇情事件
    this.addEvent({
      id: 'story_start',
      type: EventType.Story,
      title: '夢想的起點',
      description: '你剛接任球隊教練，懷著對甲子園的夢想開始新的征程。',
      conditions: [{
        type: 'day',
        target: 'current_day',
        value: 1,
        operator: '=='
      }],
      choices: [{
        text: '堅定地接受挑戰',
        effects: [{
          type: 'motivation',
          target: 'all',
          value: 10
        }]
      }],
      triggered: false
    });

    // 添加隨機訓練事件
    this.addEvent({
      id: 'training_special',
      type: EventType.Training,
      title: '特別訓練機會',
      description: '一位前職業選手願意指導球隊進行特訓。',
      conditions: [{
        type: 'teamRating',
        target: 'training',
        value: 50,
        operator: '>'
      }],
      choices: [
        {
          text: '接受指導',
          effects: [{
            type: 'playerStat',
            target: 'all',
            value: 5
          }]
        },
        {
          text: '婉拒好意',
          effects: []
        }
      ],
      triggered: false
    });
  }

  // 添加事件
  private addEvent(event: GameEvent): void {
    this.events.set(event.id, event);
  }

  // 檢查事件觸發條件
  public checkEvents(team: Team): GameEvent[] {
    const triggeredEvents: GameEvent[] = [];
    
    this.events.forEach(event => {
      if (!event.triggered && this.checkEventConditions(event, team)) {
        triggeredEvents.push(event);
        event.triggered = true;
        this.triggeredEvents.add(event.id);
      }
    });

    return triggeredEvents;
  }

  // 檢查單個事件的條件
  private checkEventConditions(event: GameEvent, team: Team): boolean {
    const gameManager = GameManager.getInstance();
    const playerData = gameManager.getPlayerData();

    return event.conditions.every(condition => {
      switch (condition.type) {
        case 'day':
          return this.compareValues(playerData.day, condition.value, condition.operator);
        case 'money':
          return this.compareValues(playerData.money, condition.value, condition.operator);
        case 'teamRating':
          const rating = team.getTeamData().rating[condition.target as keyof typeof team.getTeamData().rating];
          return this.compareValues(rating, condition.value, condition.operator);
        case 'playerStat':
          // 實現球員能力檢查邏輯
          return true;
        case 'bond':
          // 實現羈絆等級檢查邏輯
          return true;
        default:
          return false;
      }
    });
  }

  // 數值比較輔助函數
  private compareValues(a: number, b: number, operator: string): boolean {
    switch (operator) {
      case '>':
        return a > b;
      case '<':
        return a < b;
      case '>=':
        return a >= b;
      case '<=':
        return a <= b;
      case '==':
        return a === b;
      default:
        return false;
    }
  }

  // 處理事件選擇
  public handleEventChoice(event: GameEvent, choiceIndex: number, team: Team): void {
    const choice = event.choices[choiceIndex];
    if (!choice) return;

    choice.effects.forEach(effect => {
      this.applyEventEffect(effect, team);
    });
  }

  // 應用事件效果
  private applyEventEffect(effect: EventEffect, team: Team): void {
    const gameManager = GameManager.getInstance();

    switch (effect.type) {
      case 'money':
        gameManager.updateMoney(effect.value);
        break;
      case 'playerStat':
        if (effect.target === 'all') {
          team.getTeamData().players.forEach(player => {
            // 實現球員能力提升邏輯
          });
        }
        break;
      case 'teamRating':
        // 實現球隊評價變更邏輯
        break;
      case 'motivation':
        if (effect.target === 'all') {
          team.getTeamData().players.forEach(player => {
            // 實現球員意志力變更邏輯
          });
        }
        break;
      case 'bond':
        // 實現羈絆關係變更邏輯
        break;
    }
  }

  // 建立球員間的羈絆關係
  public createBond(player1: Player, player2: Player): void {
    const bondId = this.generateBondId(player1.getPlayerData().id, player2.getPlayerData().id);
    
    if (!this.bonds.has(bondId)) {
      this.bonds.set(bondId, {
        player1Id: player1.getPlayerData().id,
        player2Id: player2.getPlayerData().id,
        level: 1,
        events: []
      });
    }
  }

  // 提升羈絆等級
  public increaseBondLevel(player1Id: string, player2Id: string): void {
    const bondId = this.generateBondId(player1Id, player2Id);
    const bond = this.bonds.get(bondId);
    
    if (bond && bond.level < 5) {
      bond.level++;
      // 觸發羈絆升級事件
      this.triggerBondEvent(bond);
    }
  }

  // 觸發羈絆事件
  private triggerBondEvent(bond: BondRelation): void {
    // 根據羈絆等級觸發相應事件
    const bondEvents = Array.from(this.events.values())
      .filter(event => 
        event.type === EventType.Bond &&
        !bond.events.includes(event.id) &&
        this.checkBondEventConditions(event, bond)
      );

    if (bondEvents.length > 0) {
      const randomEvent = bondEvents[Math.floor(Math.random() * bondEvents.length)];
      bond.events.push(randomEvent.id);
      // 將事件添加到待觸發列表
    }
  }

  // 檢查羈絆事件條件
  private checkBondEventConditions(event: GameEvent, bond: BondRelation): boolean {
    return event.conditions.some(condition => 
      condition.type === 'bond' && 
      this.compareValues(bond.level, condition.value, condition.operator)
    );
  }

  // 生成羈絆ID
  private generateBondId(player1Id: string, player2Id: string): string {
    return [player1Id, player2Id].sort().join('_');
  }

  // 獲取球員的所有羈絆關係
  public getPlayerBonds(playerId: string): BondRelation[] {
    return Array.from(this.bonds.values())
      .filter(bond => 
        bond.player1Id === playerId || 
        bond.player2Id === playerId
      );
  }

  // 獲取已觸發的事件列表
  public getTriggeredEvents(): string[] {
    return Array.from(this.triggeredEvents);
  }
}