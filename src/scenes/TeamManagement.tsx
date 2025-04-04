import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  Rating
} from '@mui/material';
import { Position } from '../core/Player';
import { Team } from '../core/Team';
import { GameManager } from '../core/GameManager';

// 定義標籤面板介面
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// 標籤面板組件
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// 球隊管理場景組件
const TeamManagement: React.FC = observer(() => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const gameManager = GameManager.getInstance();
  const team = new Team(gameManager.getPlayerData().teamName); // 這裡應該從遊戲管理器獲取當前球隊

  // 處理標籤切換
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 渲染球員列表
  const renderPlayerList = () => {
    const players = team.getTeamData().players;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>名字</TableCell>
              <TableCell>位置</TableCell>
              <TableCell>年級</TableCell>
              <TableCell>打擊</TableCell>
              <TableCell>力量</TableCell>
              <TableCell>跑壘</TableCell>
              <TableCell>傳球</TableCell>
              <TableCell>守備</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => (
              <TableRow
                key={player.id}
                selected={selectedPlayer === player.id}
                onClick={() => setSelectedPlayer(player.id)}
                sx={{ '&:hover': { cursor: 'pointer' } }}
              >
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.position}</TableCell>
                <TableCell>{player.grade}年級</TableCell>
                <TableCell>
                  <Rating
                    value={player.stats.batting / 20}
                    readOnly
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Rating
                    value={player.stats.power / 20}
                    readOnly
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Rating
                    value={player.stats.running / 20}
                    readOnly
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Rating
                    value={player.stats.throwing / 20}
                    readOnly
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Rating
                    value={player.stats.fielding / 20}
                    readOnly
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {player.condition.injury ? '受傷' :
                   player.condition.fatigue > 80 ? '疲勞' :
                   player.condition.motivation < 30 ? '低迷' : '正常'}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handlePlayerAction(player.id)}
                  >
                    查看詳情
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // 渲染陣容配置
  const renderLineup = () => {
    const positions = Object.values(Position);
    const lineup = team.getTeamData().lineup;

    return (
      <Grid container spacing={2}>
        {positions.map((position) => (
          <Grid item xs={12} sm={6} md={4} key={position}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {position}
              </Typography>
              {/* 這裡需要實現選擇球員的下拉選單 */}
              <Typography variant="body2" color="text.secondary">
                {lineup.find(id => {
                  const player = team.getTeamData().players.find(p => p.id === id);
                  return player?.position === position;
                }) || '未指派'}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  // 渲染球隊數據
  const renderTeamStats = () => {
    const teamData = team.getTeamData();

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              球隊評價
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">
                  攻擊力：
                  <Rating
                    value={teamData.rating.offense / 20}
                    readOnly
                  />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  防守力：
                  <Rating
                    value={teamData.rating.defense / 20}
                    readOnly
                  />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  投手陣：
                  <Rating
                    value={teamData.rating.pitching / 20}
                    readOnly
                  />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  團隊協作：
                  <Rating
                    value={teamData.rating.teamwork / 20}
                    readOnly
                  />
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              球隊狀態
            </Typography>
            <Typography variant="body1">
              資金：¥{teamData.funds.toLocaleString()}
            </Typography>
            <Typography variant="body1">
              球迷支持度：
              <Rating
                value={teamData.fanSupport / 20}
                readOnly
              />
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // 處理球員相關操作
  const handlePlayerAction = (playerId: string) => {
    // 實現球員詳情查看、培訓等操作
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          球隊管理
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="球員名單" />
            <Tab label="陣容配置" />
            <Tab label="球隊數據" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {renderPlayerList()}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderLineup()}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderTeamStats()}
        </TabPanel>
      </Box>
    </Container>
  );
});

export default TeamManagement;