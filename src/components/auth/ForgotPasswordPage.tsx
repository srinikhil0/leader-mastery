import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (err) {
      setError('Failed to reset password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-800 shadow-lg">
        <div className="w-full max-w-md space-y-8 transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
          {/* Company Logo */}
          <div className="flex justify-center mb-12 transform transition-all duration-500 hover:scale-105">
            <img 
              src="/leader-mastery/leader-mastery-emblem-text.png" 
              alt="Leader Mastery"
              className="h-24 w-24 drop-shadow-lg dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
            />
          </div>

          {/* Title */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Password Reset</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {error && (
            <div className="bg-error/10 text-error p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-500/10 text-green-500 p-3 rounded-lg text-sm text-center">
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label 
                className={`absolute left-3 transition-all duration-300 ${
                  isEmailFocused || email
                    ? '-top-2.5 text-xs text-primary bg-white dark:bg-gray-800 px-2 font-medium'
                    : 'top-3.5 text-gray-400 bg-transparent'
                }`}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                required
                className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                  bg-gray-50/30 dark:bg-gray-700/30 focus:bg-white dark:focus:bg-gray-700
                  focus:outline-none focus:border-primary dark:focus:border-primary 
                  focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 
                  transition-all duration-300 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-300
                ${loading || !email
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
                  : 'bg-primary text-white hover:scale-[1.02] hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-gray-800'
                }`}
            >
              Reset Password
            </button>
          </form>

          {/* Links */}
          <div className="text-center space-y-4 mt-8">
            <Link 
              to="/login" 
              className="text-primary hover:text-primary/80 font-medium transition-all duration-300 hover:underline block"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden md:flex w-1/2 bg-primary flex-col items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] bg-repeat"></div>
        </div>
        
        <div className="relative z-10 text-center transform transition-all duration-500 hover:scale-105">
          <img 
            src="/leader-mastery/leader-mastery-emblem-text.png"
            alt="Leader Mastery"
            className="w-48 h-48 mb-8 drop-shadow-2xl dark:drop-shadow-[0_0_1rem_#ffffff70]"
          />
        </div>
      </div>
    </div>
  );
}; 