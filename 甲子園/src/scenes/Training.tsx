import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox
} from '@mui/material';
import { GameManager } from '../core/GameManager';
import { Team } from '../core/Team';
import { Player } from '../core/Player';

// 訓練類型介面
interface TrainingType {
  id: string;
  name: string;
  description: string;
  targetStats: string[];
  cost: number;
  effectiveness: number;
}

// 定義訓練選項
const trainingTypes: TrainingType[] = [
  {
    id: 'basic_training',
    name: '基礎訓練',
    description: '提升球員的基本能力',
    targetStats: ['batting', 'fielding'],
    cost: 2,
    effectiveness: 1.0
  },
  {
    id: 'power_training',
    name: '重點特訓',
    description: '針對特定能力進行集中訓練',
    targetStats: ['power', 'throwing'],
    cost: 3,
    effectiveness: 1.5
  },
  {
    id: 'team_training',
    name: '團隊訓練',
    description: '提升整體配合和默契',
    targetStats: ['teamwork'],
    cost: 4,
    effectiveness: 2.0
  },
  {
    id: 'special_training',
    name: '特殊訓練',
    description: '有機會大幅提升能力，但也可能增加疲勞',
    targetStats: ['batting', 'power', 'running', 'throwing', 'fielding'],
    cost: 5,
    effectiveness: 2.5
  }
];

// 訓練場景組件
const Training: React.FC = observer(() => {
  const [selectedTraining, setSelectedTraining] = useState<TrainingType | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [trainingResults, setTrainingResults] = useState<any[]>([]);

  const gameManager = GameManager.getInstance();
  const team = new Team(gameManager.getPlayerData().teamName); // 這裡應該從遊戲管理器獲取當前球隊

  // 選擇訓練類型
  const handleSelectTraining = (training: TrainingType) => {
    setSelectedTraining(training);
    setSelectedPlayers([]);
  };

  // 選擇參與訓練的球員
  const handleTogglePlayer = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  // 執行訓練
  const executeTraining = () => {
    if (!selectedTraining || selectedPlayers.length === 0) return;

    const results = [];
    for (const playerId of selectedPlayers) {
      const player = team.getTeamData().players.find(p => p.id === playerId);
      if (player) {
        // 計算訓練效果
        const improvements = selectedTraining.targetStats.map(stat => ({
          stat,
          improvement: Math.floor(
            Math.random() * 3 * selectedTraining.effectiveness
          )
        }));

        // 更新球員能力值
        improvements.forEach(({ stat, improvement }) => {
          // 這裡需要實現實際的能力值更新邏輯
        });

        results.push({
          playerName: player.name,
          improvements
        });
      }
    }

    // 消耗行動點數
    gameManager.useActionPoints(selectedTraining.cost);

    // 顯示訓練結果
    setTrainingResults(results);
    setShowResults(true);
  };

  // 渲染訓練選項卡片
  const renderTrainingCards = () => (
    <Grid container spacing={2}>
      {trainingTypes.map((training) => (
        <Grid item xs={12} sm={6} md={3} key={training.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              bgcolor: selectedTraining?.id === training.id ? 'action.selected' : 'background.paper'
            }}
            onClick={() => handleSelectTraining(training)}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {training.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {training.description}
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                消耗行動點數：{training.cost}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                color="primary"
                disabled={gameManager.getPlayerData().actionPoints < training.cost}
              >
                選擇
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // 渲染球員選擇列表
  const renderPlayerSelection = () => {
    if (!selectedTraining) return null;

    return (
      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          選擇參與訓練的球員
        </Typography>
        <List>
          {team.getTeamData().players.map((player) => (
            <ListItem key={player.id}>
              <ListItemText
                primary={player.name}
                secondary={`${player.position} | 疲勞度: ${player.condition.fatigue}%`}
              />
              <ListItemSecondaryAction>
                <Checkbox
                  edge="end"
                  onChange={() => handleTogglePlayer(player.id)}
                  checked={selectedPlayers.includes(player.id)}
                  disabled={player.condition.fatigue >= 100}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={executeTraining}
          disabled={selectedPlayers.length === 0}
        >
          開始訓練
        </Button>
      </Paper>
    );
  };

  // 訓練結果對話框
  const renderResultDialog = () => (
    <Dialog
      open={showResults}
      onClose={() => setShowResults(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>訓練結果</DialogTitle>
      <DialogContent>
        {trainingResults.map((result, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              {result.playerName}
            </Typography>
            {result.improvements.map((imp: any, i: number) => (
              <Typography key={i} variant="body2" color="text.secondary">
                {imp.stat}: +{imp.improvement}
              </Typography>
            ))}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowResults(false)}>
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          訓練
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          剩餘行動點數：{gameManager.getPlayerData().actionPoints}
        </Typography>

        {renderTrainingCards()}
        {renderPlayerSelection()}
        {renderResultDialog()}
      </Box>
    </Container>
  );
});

export default Training;