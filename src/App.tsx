import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './components/chat/ChatPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignupPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import DocumentHistory from './pages/DocumentHistory';
import NotFoundPage from './components/NotFoundPage';
import './App.css'

function App() {
  return (
    <Router basename="/leader-mastery">
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <DocumentHistory />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
