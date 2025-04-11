import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to sign in');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Login Form */}
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

          {/* Welcome Text */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back!</h2>
          </div>

          {error && (
            <div className="bg-error/10 text-error p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
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

            <div className="relative">
              <label 
                className={`absolute left-3 transition-all duration-300 ${
                  isPasswordFocused || password
                    ? '-top-2.5 text-xs text-primary bg-white dark:bg-gray-800 px-2 font-medium'
                    : 'top-3.5 text-gray-400 bg-transparent'
                }`}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
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
              disabled={loading || !email || !password}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-300
                ${loading || !email || !password 
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
                  : 'bg-primary text-white hover:scale-[1.02] hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-gray-800'
                }`}
            >
              Sign In
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-gray-800 px-6 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-4 gap-4">
            {/* Google */}
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg 
                hover:border-primary dark:hover:border-primary 
                transform transition-all duration-300 hover:scale-105 
                hover:shadow-md dark:hover:shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1)]
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-gray-800
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
              </svg>
            </button>

            {/* Facebook */}
            <button className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg 
              hover:border-primary dark:hover:border-primary 
              transform transition-all duration-300 hover:scale-105 
              hover:shadow-md dark:hover:shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1)]
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-gray-800">
              <svg className="w-6 h-6 mx-auto" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            {/* Instagram */}
            <button className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg 
              hover:border-primary dark:hover:border-primary 
              transform transition-all duration-300 hover:scale-105 
              hover:shadow-md dark:hover:shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1)]
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-gray-800">
              <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24">
                <defs>
                  <radialGradient id="instagram-gradient" r="150%" cx="30%" cy="107%">
                    <stop stopColor="#fdf497" offset="0%" />
                    <stop stopColor="#fdf497" offset="5%" />
                    <stop stopColor="#fd5949" offset="45%" />
                    <stop stopColor="#d6249f" offset="60%" />
                    <stop stopColor="#285AEB" offset="90%" />
                  </radialGradient>
                </defs>
                <path fill="url(#instagram-gradient)" d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
              </svg>
            </button>

            {/* Phone */}
            <button className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg 
              hover:border-primary dark:hover:border-primary 
              transform transition-all duration-300 hover:scale-105 
              hover:shadow-md dark:hover:shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1)]
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-gray-800">
              <svg className="w-6 h-6 mx-auto" fill="#254F9E" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
            </button>
          </div>

          {/* Links */}
          <div className="text-center space-y-4 mt-8">
            <Link 
              to="/forgot-password" 
              className="text-primary hover:text-primary/80 font-medium transition-all duration-300 hover:underline block"
            >
              Forgot Password?
            </Link>
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-primary hover:text-primary/80 font-medium transition-all duration-300 hover:underline"
              >
                Sign Up
              </Link>
            </p>
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

export default LoginPage;
