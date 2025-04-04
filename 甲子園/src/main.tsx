import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// 遊戲主題設置
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// 遊戲主要場景
const MainGame = React.lazy(() => import('./scenes/MainGame'));
const TeamManagement = React.lazy(() => import('./scenes/TeamManagement'));
const Training = React.lazy(() => import('./scenes/Training'));
const Match = React.lazy(() => import('./scenes/Match'));

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <React.Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<MainGame />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/training" element={<Training />} />
            <Route path="/match" element={<Match />} />
          </Routes>
        </React.Suspense>
      </ThemeProvider>
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);