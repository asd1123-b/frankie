import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import { GameManager } from '../core/GameManager';
import { Team } from '../core/Team';
import { MatchSimulator, MatchResult } from '../core/MatchSimulator';

// 對手球隊介面
interface OpponentTeam {
  id: string;
  name: string;
  level: number;
  description: string;
}

// 預設對手列表
const opponents: OpponentTeam[] = [
  {
    id: 'team1',
    name: '青春高校',
    level: 1,
    description: '以穩健的打擊見長的球隊'
  },
  {
    id: 'team2',
    name: '光榮學園',
    level: 2,
    description: '擁有出色投手陣容的強隊'
  },
  {
    id: 'team3',
    name: '夢想高中',
    level: 3,
    description: '全國大賽常客，實力堅強'
  }
];

// 比賽場景組件
const Match: React.FC = observer(() => {
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentTeam | null>(null);
  const [matchInProgress, setMatchInProgress] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [currentInning, setCurrentInning] = useState(1);
  const [showResult, setShowResult] = useState(false);

  const gameManager = GameManager.getInstance();
  const team = new Team(gameManager.getPlayerData().teamName); // 這裡應該從遊戲管理器獲取當前球隊

  // 選擇對手
  const handleSelectOpponent = (opponent: OpponentTeam) => {
    setSelectedOpponent(opponent);
  };

  // 開始比賽
  const startMatch = () => {
    if (!selectedOpponent) return;

    setMatchInProgress(true);
    setCurrentInning(1);

    // 創建對手球隊實例
    const opponentTeam = new Team(selectedOpponent.name);
    // 這裡需要根據對手等級設置適當的球隊實力

    // 創建比賽模擬器
    const simulator = new MatchSimulator(team, opponentTeam);
    const result = simulator.simulateMatch();

    // 消耗行動點數
    gameManager.useActionPoints(3);

    // 更新比賽結果
    setMatchResult(result);
    simulateMatchProgress();
  };

  // 模擬比賽進程
  const simulateMatchProgress = () => {
    const totalInnings = 9;
    const inningInterval = setInterval(() => {
      setCurrentInning(prev => {
        if (prev >= totalInnings) {
          clearInterval(inningInterval);
          setMatchInProgress(false);
          setShowResult(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // 渲染對手選擇
  const renderOpponentSelection = () => (
    <Grid container spacing={2}>
      {opponents.map((opponent) => (
        <Grid item xs={12} sm={6} md={4} key={opponent.id}>
          <Paper
            sx={{
              p: 2,
              cursor: 'pointer',
              bgcolor: selectedOpponent?.id === opponent.id ? 'action.selected' : 'background.paper'
            }}
            onClick={() => handleSelectOpponent(opponent)}
          >
            <Typography variant="h6" gutterBottom>
              {opponent.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {opponent.description}
            </Typography>
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              難度：{'★'.repeat(opponent.level)}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  // 渲染比賽進程
  const renderMatchProgress = () => {
    if (!matchInProgress) return null;

    return (
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          比賽進行中 - 第 {currentInning} 局
        </Typography>
        <LinearProgress sx={{ mt: 2 }} />
        {matchResult && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" align="center">
              {matchResult.homeTeam} {matchResult.homeScore} - {matchResult.awayScore} {matchResult.awayTeam}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  // 渲染比賽結果
  const renderMatchResult = () => {
    if (!matchResult) return null;

    return (
      <Dialog
        open={showResult}
        onClose={() => setShowResult(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>比賽結果</DialogTitle>
        <DialogContent>
          <Typography variant="h5" align="center" gutterBottom>
            {matchResult.homeTeam} {matchResult.homeScore} - {matchResult.awayScore} {matchResult.awayTeam}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            比賽進程
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>局數</TableCell>
                  <TableCell>上半局</TableCell>
                  <TableCell>下半局</TableCell>
                  <TableCell>重要事件</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matchResult.innings.map((inning, index) => (
                  <TableRow key={index}>
                    <TableCell>{inning.inning}</TableCell>
                    <TableCell>{inning.topScore}</TableCell>
                    <TableCell>{inning.bottomScore}</TableCell>
                    <TableCell>
                      {inning.events.map((event, i) => (
                        <Typography key={i} variant="body2">
                          {event}
                        </Typography>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            最有價值球員（MVP）
          </Typography>
          <Typography variant="body1">
            {matchResult.mvp}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            精彩時刻
          </Typography>
          {matchResult.highlights.map((highlight, index) => (
            <Typography key={index} variant="body2" gutterBottom>
              {highlight}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResult(false)}>
            確定
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          比賽
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          剩餘行動點數：{gameManager.getPlayerData().actionPoints}
        </Typography>

        {!matchInProgress && (
          <>
            <Typography variant="h6" gutterBottom>
              選擇對手
            </Typography>
            {renderOpponentSelection()}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              onClick={startMatch}
              disabled={
                !selectedOpponent ||
                gameManager.getPlayerData().actionPoints < 3
              }
            >
              開始比賽（消耗3點行動點數）
            </Button>
          </>
        )}

        {renderMatchProgress()}
        {renderMatchResult()}
      </Box>
    </Container>
  );
});

export default Match;