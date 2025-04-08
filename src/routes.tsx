import { Routes, Route } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ChatPage from './components/chat/ChatPage';
import DocumentHistory from './pages/DocumentHistory';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/documents" element={<DocumentHistory />} />
    </Routes>
  );
};

export default AppRoutes; 