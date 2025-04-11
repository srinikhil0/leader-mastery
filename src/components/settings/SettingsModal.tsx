import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface User {
  name: string;
  email: string;
  lastLogin: Date;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

type SettingsTab = 'profile' | 'terms';

const SettingsModal = ({ isOpen, onClose, user }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="fixed inset-0 flex items-center justify-center p-0 md:p-4">
        <div className="bg-light-bg-primary dark:bg-dark-bg-primary w-full h-full md:h-[80vh] md:w-[90vw] md:max-w-4xl md:rounded-lg flex flex-col md:flex-row relative">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border md:hidden">
            <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Settings</h2>
            <button 
              onClick={onClose}
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-light-border dark:border-dark-border">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
              <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Settings</h2>
            </div>

            {/* Navigation */}
            <nav className="flex md:block border-b md:border-b-0 border-light-border dark:border-dark-border">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 md:w-full px-4 py-3 md:py-2 flex items-center gap-3 text-left ${
                  activeTab === 'profile' 
                    ? 'bg-light-bg-secondary dark:bg-dark-bg-secondary text-primary'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                className={`flex-1 md:w-full px-4 py-3 md:py-2 flex items-center gap-3 text-left ${
                  activeTab === 'terms'
                    ? 'bg-light-bg-secondary dark:bg-dark-bg-secondary text-primary'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Terms & Conditions</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-light-bg-secondary
            [&::-webkit-scrollbar-track]:dark:bg-dark-bg-secondary
            [&::-webkit-scrollbar-thumb]:bg-light-border
            [&::-webkit-scrollbar-thumb]:dark:bg-dark-border
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:border-2
            [&::-webkit-scrollbar-thumb]:border-light-bg-primary
            [&::-webkit-scrollbar-thumb]:dark:border-dark-bg-primary">
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
              {activeTab === 'profile' ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary md:block hidden">Profile Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-3 py-2 bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full px-3 py-2 bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                        Retype New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                        Theme
                      </label>
                      <select 
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                        className="w-full px-3 py-2 bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="system">System</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                        Last login: {user.lastLogin.toLocaleString()}
                      </p>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={handleLogout}
                        className="w-full py-2 px-4 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary md:block hidden">Terms & Conditions</h3>
                  
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <h4>Terms of Service</h4>
                    <p>
                      By accessing and using this application, you agree to comply with and be bound by these terms and conditions.
                    </p>
                    
                    <h4 className="mt-6">Privacy Policy</h4>
                    <p>
                      We respect your privacy and are committed to protecting your personal information. Our privacy policy outlines how we collect, use, and safeguard your data.
                    </p>
                    
                    <h4 className="mt-6">Cookie Policy</h4>
                    <p>
                      This application uses cookies to enhance your browsing experience. By continuing to use this application, you consent to our use of cookies in accordance with our cookie policy.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Close Button */}
          <button 
            onClick={onClose}
            className="hidden md:block absolute top-4 right-4 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 