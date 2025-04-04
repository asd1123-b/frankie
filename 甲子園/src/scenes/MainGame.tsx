import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Container, Grid, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GameManager } from '../core/GameManager';
import { Team } from '../core/Team';
import { EventManager } from '../core/EventManager';

// 主遊戲場景組件
const MainGame: React.FC = observer(() => {
  const navigate = useNavigate();
  const gameManager = GameManager.getInstance();
  const eventManager = EventManager.getInstance();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [showEvent, setShowEvent] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  // 初始化遊戲數據
  useEffect(() => {
    const playerData = gameManager.getPlayerData();
    if (!playerData.name) {
      // 如果沒有玩家數據，顯示新遊戲對話框
      showNewGameDialog();
    } else {
      // 載入已有的遊戲數據
      loadGameData();
    }
  }, []);

  // 開始試玩模式
  const startDemoMode = () => {
    // 初始化試玩數據
    gameManager.initializePlayer("試玩玩家", "試玩高校");
    gameManager.useActionPoints(-20); // 給予充足的行動點數
    updateGameUI();
  };

  // 顯示新遊戲對話框
  const showNewGameDialog = () => {
    // 實現新遊戲創建邏輯
  };

  // 載入遊戲數據
  const loadGameData = () => {
    if (gameManager.loadGame()) {
      // 載入成功，更新UI
      updateGameUI();
    }
  };

  // 更新遊戲UI
  const updateGameUI = () => {
    const playerData = gameManager.getPlayerData();
    // 更新UI顯示
  };

  // 處理每日行動
  const handleDailyAction = (actionType: string) => {
    switch (actionType) {
      case 'training':
        navigate('/training');
        break;
      case 'match':
        navigate('/match');
        break;
      case 'team':
        navigate('/team');
        break;
      default:
        break;
    }
  };

  // 結束當天
  const endDay = () => {
    gameManager.nextDay();
    // 檢查事件觸發
    if (currentTeam) {
      const events = eventManager.checkEvents(currentTeam);
      if (events.length > 0) {
        setCurrentEvent(events[0]);
        setShowEvent(true);
      }
    }
    // 自動保存
    gameManager.saveGame();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          {/* 遊戲狀態面板 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                第 {gameManager.getPlayerData().day} 天
              </Typography>
              <Typography variant="body1">
                剩餘行動點數: {gameManager.getPlayerData().actionPoints}
              </Typography>
              <Typography variant="body1">
                資金: ¥{gameManager.getPlayerData().money.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>

          {/* 行動選項 */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                今日行動
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleDailyAction('training')}
                    disabled={gameManager.getPlayerData().actionPoints < 2}
                  >
                    訓練（2點）
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleDailyAction('match')}
                    disabled={gameManager.getPlayerData().actionPoints < 3}
                  >
                    比賽（3點）
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleDailyAction('team')}
                    disabled={gameManager.getPlayerData().actionPoints < 1}
                  >
                    球隊管理（1點）
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* 球隊狀態 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                球隊狀態
              </Typography>
              {currentTeam && (
                <>
                  <Typography variant="body1">
                    士氣: {currentTeam.getTeamData().rating.morale}
                  </Typography>
                  <Typography variant="body1">
                    團隊協作: {currentTeam.getTeamData().rating.teamwork}
                  </Typography>
                  <Typography variant="body1">
                    球迷支持: {currentTeam.getTeamData().fanSupport}
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* 試玩模式按鈕 */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={startDemoMode}
              sx={{ mt: 2, mb: 2 }}
            >
              開始試玩
            </Button>
          </Grid>

          {/* 結束當天按鈕 */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={endDay}
              sx={{ mt: 2 }}
            >
              結束今天
            </Button>
          </Grid>
        </Grid>

        {/* 事件對話框 */}
        {showEvent && currentEvent && (
          <Paper
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              maxWidth: 600,
              p: 4,
              zIndex: 1000,
            }}
          >
            <Typography variant="h5" gutterBottom>
              {currentEvent.title}
            </Typography>
            <Typography variant="body1" paragraph>
              {currentEvent.description}
            </Typography>
            <Grid container spacing={2}>
              {currentEvent.choices.map((choice: any, index: number) => (
                <Grid item xs={12} key={index}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      eventManager.handleEventChoice(currentEvent, index, currentTeam!);
                      setShowEvent(false);
                    }}
                  >
                    {choice.text}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
});

export default MainGame;