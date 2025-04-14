import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [focusedField, setFocusedField] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    const strength = {
      score: 0,
      hasLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    let score = 0;
    if (strength.hasLength) score++;
    if (strength.hasUppercase) score++;
    if (strength.hasLowercase) score++;
    if (strength.hasNumber) score++;
    if (strength.hasSpecialChar) score++;

    strength.score = score;
    setPasswordStrength(strength);
  };

  // Check if passwords match
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-lime-500';
      case 5: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const CheckIcon = ({ className }: { className: boolean }) => (
    <svg 
      className={`w-4 h-4 ${className ? 'text-green-600' : 'text-gray-400'}`}
      fill="none" 
      strokeWidth="2" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || passwordStrength.score < 3) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signUp(formData.email, formData.password);
      navigate('/chat');
    } catch (err) {
      setError('Failed to create an account');
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
      navigate('/chat');
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Signup Form */}
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
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          </div>

          {error && (
            <div className="bg-error/10 text-error p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields Row */}
            <div className="flex gap-4">
              {/* First Name */}
              <div className="relative flex-1">
                <label 
                  className={`absolute left-3 transition-all duration-300 ${
                    focusedField === 'firstName' || formData.firstName
                      ? '-top-2.5 text-xs text-primary bg-white dark:bg-gray-800 px-2 font-medium'
                      : 'top-3.5 text-gray-400 bg-transparent'
                  }`}
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField('')}
                  required
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                    bg-gray-50/30 dark:bg-gray-700/30 focus:bg-white dark:focus:bg-gray-700
                    focus:outline-none focus:border-primary dark:focus:border-primary 
                    focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 
                    transition-all duration-300 text-gray-900 dark:text-white"
                />
              </div>

              {/* Last Name */}
              <div className="relative flex-1">
                <label 
                  className={`absolute left-3 transition-all duration-300 ${
                    focusedField === 'lastName' || formData.lastName
                      ? '-top-2.5 text-xs text-primary bg-white dark:bg-gray-800 px-2 font-medium'
                      : 'top-3.5 text-gray-400 bg-transparent'
                  }`}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField('')}
                  required
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                    bg-gray-50/30 dark:bg-gray-700/30 focus:bg-white dark:focus:bg-gray-700
                    focus:outline-none focus:border-primary dark:focus:border-primary 
                    focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 
                    transition-all duration-300 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label 
                className={`absolute left-3 transition-all duration-300 ${
                  focusedField === 'email' || formData.email
                    ? '-top-2.5 text-xs text-primary bg-white dark:bg-gray-800 px-2 font-medium'
                    : 'top-3.5 text-gray-400 bg-transparent'
                }`}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                required
                className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl 
                  bg-gray-50/30 dark:bg-gray-700/30 focus:bg-white dark:focus:bg-gray-700
                  focus:outline-none focus:border-primary dark:focus:border-primary 
                  focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 
                  transition-all duration-300 text-gray-900 dark:text-white"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label 
                className={`absolute left-3 transition-all duration-300 ${
                  focusedField === 'password' || formData.password
                    ? '-top-2.5 text-xs text-primary bg-white dark:bg-gray-800 px-2 font-medium'
                    : 'top-3.5 text-gray-400 bg-transparent'
                }`}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3.5 border rounded-xl 
                  bg-gray-50/30 dark:bg-gray-700/30 focus:bg-white dark:focus:bg-gray-700
                  focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 
                  transition-all duration-300 text-gray-900 dark:text-white
                  ${focusedField === 'password' ? 'border-primary' : 'border-gray-200 dark:border-gray-600'}
                  ${!focusedField && formData.password && passwordStrength.score < 3 ? 'border-red-500 dark:border-red-500' : ''}`}
              />
              <div className="mt-1 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 w-full rounded-full transition-colors duration-300 ${
                        passwordStrength.score >= level
                          ? getStrengthColor(passwordStrength.score)
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className={`flex items-center gap-1 ${passwordStrength.hasLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <CheckIcon className={passwordStrength.hasLength}/> 8+ Characters
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <CheckIcon className={passwordStrength.hasUppercase}/> Uppercase
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <CheckIcon className={passwordStrength.hasLowercase}/> Lowercase
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <CheckIcon className={passwordStrength.hasNumber}/> Number
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <CheckIcon className={passwordStrength.hasSpecialChar}/> Special Character
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label 
                className={`absolute left-3 transition-all duration-300 ${
                  focusedField === 'confirmPassword' || formData.confirmPassword
                    ? '-top-2.5 text-xs text-primary bg-white dark:bg-gray-800 px-2 font-medium'
                    : 'top-3.5 text-gray-400 bg-transparent'
                }`}
              >
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3.5 border rounded-xl 
                  bg-gray-50/30 dark:bg-gray-700/30 focus:bg-white dark:focus:bg-gray-700
                  focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 
                  transition-all duration-300 text-gray-900 dark:text-white
                  ${focusedField === 'confirmPassword' ? 'border-primary' : 'border-gray-200 dark:border-gray-600'}
                  ${!focusedField && formData.confirmPassword && !passwordsMatch ? 'border-red-500 dark:border-red-500' : ''}`}
              />
              {formData.confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !passwordsMatch || passwordStrength.score < 3}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-300
                ${loading || !formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !passwordsMatch || passwordStrength.score < 3
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
                  : 'bg-primary text-white hover:scale-[1.02] hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-gray-800'
                }`}
            >
              Create Account
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-gray-800 px-6 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Or sign up with
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

            {/* Microsoft */}
            <button className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg 
              hover:border-primary dark:hover:border-primary 
              transform transition-all duration-300 hover:scale-105 
              hover:shadow-md dark:hover:shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1)]
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-gray-800">
              <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24">
                <path fill="#F25022" d="M11.4 24H0V12.6h11.4V24z"/>
                <path fill="#00A4EF" d="M24 24H12.6V12.6H24V24z"/>
                <path fill="#7FBA00" d="M11.4 11.4H0V0h11.4v11.4z"/>
                <path fill="#FFB900" d="M24 11.4H12.6V0H24v11.4z"/>
              </svg>
            </button>

            {/* Apple */}
            <button className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg 
              hover:border-primary dark:hover:border-primary 
              transform transition-all duration-300 hover:scale-105 
              hover:shadow-md dark:hover:shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1)]
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-gray-800">
              <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24">
                <path fill="#000000" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
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

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary hover:text-primary/80 font-medium transition-all duration-300 hover:underline"
              >
                Sign In
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
