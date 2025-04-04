import { makeAutoObservable } from 'mobx';

// 球員位置枚舉
export enum Position {
  Pitcher = '投手',
  Catcher = '捕手',
  FirstBase = '一壘手',
  SecondBase = '二壘手',
  ThirdBase = '三壘手',
  ShortStop = '游擊手',
  LeftField = '左外野手',
  CenterField = '中外野手',
  RightField = '右外野手'
}

// 球員能力介面
interface PlayerStats {
  batting: number;      // 打擊
  power: number;        // 力量
  running: number;      // 跑壘
  throwing: number;     // 傳球
  fielding: number;     // 守備
  pitching?: number;    // 投球（僅投手需要）
  control?: number;     // 控球（僅投手需要）
  stamina?: number;     // 體力（僅投手需要）
}

// 球員狀態
interface PlayerCondition {
  fatigue: number;      // 疲勞度
  motivation: number;   // 意志力
  injury: boolean;      // 受傷狀態
}

// 球員類別
export class Player {
  private id: string;
  private name: string;
  private position: Position;
  private grade: number;        // 年級（1-3）
  private stats: PlayerStats;
  private condition: PlayerCondition;
  private potential: number;    // 潛力值（1-5）

  constructor(id: string, name: string, position: Position, grade: number) {
    makeAutoObservable(this);
    
    this.id = id;
    this.name = name;
    this.position = position;
    this.grade = grade;
    
    // 初始化基礎能力值
    this.stats = {
      batting: Math.floor(Math.random() * 30) + 40,
      power: Math.floor(Math.random() * 30) + 40,
      running: Math.floor(Math.random() * 30) + 40,
      throwing: Math.floor(Math.random() * 30) + 40,
      fielding: Math.floor(Math.random() * 30) + 40
    };

    // 如果是投手，添加投手特有能力值
    if (position === Position.Pitcher) {
      this.stats.pitching = Math.floor(Math.random() * 30) + 40;
      this.stats.control = Math.floor(Math.random() * 30) + 40;
      this.stats.stamina = Math.floor(Math.random() * 30) + 40;
    }

    // 初始化狀態
    this.condition = {
      fatigue: 0,
      motivation: 100,
      injury: false
    };

    // 設定潛力值
    this.potential = Math.floor(Math.random() * 5) + 1;
  }

  // 訓練方法
  public train(type: keyof PlayerStats): void {
    if (this.condition.fatigue >= 100) {
      return; // 過度疲勞無法訓練
    }

    const improvement = Math.floor(Math.random() * 3) + 1;
    if (this.stats[type]) {
      this.stats[type] = Math.min(100, (this.stats[type] as number) + improvement);
    }

    // 增加疲勞度
    this.condition.fatigue += 10;
    // 根據潛力值增加額外成長
    if (Math.random() < this.potential / 10) {
      this.stats[type] = Math.min(100, (this.stats[type] as number) + 1);
    }
  }

  // 休息恢復
  public rest(): void {
    this.condition.fatigue = Math.max(0, this.condition.fatigue - 30);
    this.condition.motivation = Math.min(100, this.condition.motivation + 10);
  }

  // 受傷
  public injure(): void {
    this.condition.injury = true;
    this.condition.motivation = Math.max(50, this.condition.motivation - 20);
  }

  // 恢復傷勢
  public heal(): void {
    this.condition.injury = false;
    this.condition.motivation = Math.min(100, this.condition.motivation + 10);
  }

  // 獲取球員資料
  public getPlayerData() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      grade: this.grade,
      stats: { ...this.stats },
      condition: { ...this.condition },
      potential: this.potential
    };
  }

  // 更新意志力
  public updateMotivation(change: number): void {
    this.condition.motivation = Math.max(0, Math.min(100, this.condition.motivation + change));
  }
}