import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routes';
import './App.css'

const App = () => {
  return (
    <ThemeProvider>
      <Router basename="/leader-mastery">
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
};

export default App;
