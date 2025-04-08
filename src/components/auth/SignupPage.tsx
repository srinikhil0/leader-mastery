import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SignupPage = () => {
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

  // Move this function before passwordStrengthIndicator
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

  // Move this before passwordStrengthIndicator
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

  // Then keep the rest of your code including passwordStrengthIndicator
  const passwordStrengthIndicator = (
    <div className="mt-1 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 w-full rounded-full transition-colors duration-300 ${
              passwordStrength.score >= level
                ? getStrengthColor(passwordStrength.score)
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={`flex items-center gap-1 ${passwordStrength.hasLength ? 'text-green-600' : 'text-gray-500'}`}>
          <CheckIcon className={passwordStrength.hasLength}/> 8+ Characters
        </div>
        <div className={`flex items-center gap-1 ${passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
          <CheckIcon className={passwordStrength.hasUppercase}/> Uppercase
        </div>
        <div className={`flex items-center gap-1 ${passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
          <CheckIcon className={passwordStrength.hasLowercase}/> Lowercase
        </div>
        <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
          <CheckIcon className={passwordStrength.hasNumber}/> Number
        </div>
        <div className={`flex items-center gap-1 ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
          <CheckIcon className={passwordStrength.hasSpecialChar}/> Special Character
        </div>
      </div>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Left Side - Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white shadow-lg">
        <div className="w-full max-w-md space-y-8 transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
          {/* Company Logo */}
          <div className="flex justify-center mb-12 transform transition-all duration-500 hover:scale-105">
            <img 
              src="./leader-mastery-emblem-text.png" 
              alt="Leader Mastery" 
              className="h-24 w-24 drop-shadow-lg"
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields Row */}
            <div className="flex gap-4">
              {/* First Name */}
              <div className="relative flex-1">
                <label 
                  className={`absolute left-3 transition-all duration-300 ${
                    focusedField === 'firstName' || formData.firstName
                      ? '-top-2.5 text-xs text-primary bg-white px-2'
                      : 'top-2.5 text-gray-500'
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-all duration-300 mt-2"
                />
              </div>

              {/* Last Name */}
              <div className="relative flex-1">
                <label 
                  className={`absolute left-3 transition-all duration-300 ${
                    focusedField === 'lastName' || formData.lastName
                      ? '-top-2.5 text-xs text-primary bg-white px-2'
                      : 'top-2.5 text-gray-500'
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-all duration-300 mt-2"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label 
                className={`absolute left-3 transition-all duration-300 ${
                  focusedField === 'email' || formData.email
                    ? '-top-2.5 text-xs text-primary bg-white px-2'
                    : 'top-2.5 text-gray-500'
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-all duration-300 mt-2"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label 
                className={`absolute left-3 transition-all duration-300 ${
                  focusedField === 'password' || formData.password
                    ? '-top-2.5 text-xs text-primary bg-white px-2'
                    : 'top-2.5 text-gray-500'
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
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 mt-2
                  ${focusedField === 'password' ? 'border-primary' : 'border-gray-200'}
                  ${!focusedField && formData.password && passwordStrength.score < 3 ? 'border-red-500' : ''}`}
              />
              {passwordStrengthIndicator}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label 
                className={`absolute left-3 transition-all duration-300 ${
                  focusedField === 'confirmPassword' || formData.confirmPassword
                    ? '-top-2.5 text-xs text-primary bg-white px-2'
                    : 'top-2.5 text-gray-500'
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
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 mt-2
                  ${focusedField === 'confirmPassword' ? 'border-primary' : 'border-gray-200'}
                  ${!focusedField && formData.confirmPassword && !passwordsMatch ? 'border-red-500' : ''}`}
              />
              {formData.confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-sm text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!passwordsMatch || passwordStrength.score < 3}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-300
                ${!passwordsMatch || passwordStrength.score < 3
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:scale-[1.02] hover:shadow-lg'
                }
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            >
              Create Account
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-6 text-sm text-gray-500 uppercase tracking-wider">Or sign up with</span>
            </div>
          </div>

          {/* Social Login Buttons - Reuse from LoginPage */}
          <div className="grid grid-cols-4 gap-3">
            {/* Google */}
            <button className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary 
              transform transition-all duration-300 hover:scale-105 hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24">
                {/* Google SVG Path */}
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
              </svg>
            </button>

            {/* Facebook */}
            <button className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary 
              transform transition-all duration-300 hover:scale-105 hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <svg className="w-6 h-6 mx-auto" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            {/* Instagram */}
            <button className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary 
              transform transition-all duration-300 hover:scale-105 hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
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
            <button className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary 
              transform transition-all duration-300 hover:scale-105 hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <svg className="w-6 h-6 mx-auto" fill="#254F9E" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
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
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] bg-repeat"></div>
        </div>
        
        <div className="relative z-10 text-center transform transition-all duration-500 hover:scale-105">
          <img 
            src="./leader-mastery-emblem-text.png"
            alt="Leader Mastery"
            className="w-48 h-48 mb-8 drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
