import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
    setIsSubmitted(true);
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Left Side - Forgot Password Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white shadow-lg">
        <div className="w-full max-w-md space-y-8 transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
          {/* Company Logo */}
          <div className="flex justify-center mb-12 transform transition-all duration-500 hover:scale-105">
            <img 
              src="/leader-mastery-emblem-text.png" 
              alt="Leader Mastery" 
              className="h-24 w-24 drop-shadow-lg"
            />
          </div>

          {/* Title and Description */}
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-600">Enter your email address and we'll send you instructions to reset your password.</p>
          </div>

          {isSubmitted ? (
            // Success Message
            <div className="text-center space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Check Your Email</h3>
                <p className="text-green-700">
                  If an account exists for {email}, you will receive password reset instructions.
                </p>
              </div>
              <Link 
                to="/login" 
                className="text-primary hover:text-primary/80 font-medium transition-all duration-300 hover:underline block"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            // Reset Password Form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label 
                  className={`absolute left-3 transition-all duration-300 ${
                    isEmailFocused || email
                      ? '-top-2.5 text-xs text-primary bg-white px-2'
                      : 'top-2.5 text-gray-500'
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-all duration-300 mt-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-medium 
                  transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Send Reset Instructions
              </button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 font-medium transition-all duration-300 hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden md:flex w-1/2 bg-primary flex-col items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] bg-repeat"></div>
        </div>
        
        <div className="relative z-10 text-center transform transition-all duration-500 hover:scale-105">
          <img 
            src="/leader-mastery-emblem-text.png"
            alt="Leader Mastery"
            className="w-48 h-48 mb-8 drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 