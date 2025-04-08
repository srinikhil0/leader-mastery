import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-12 transform transition-all duration-500 hover:scale-105">
          <img 
            src="./leader-mastery-emblem-text.png" 
            alt="Leader Mastery" 
            className="h-48 w-48 drop-shadow-lg"
          />
        </div>

        {/* 404 Text */}
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800">Page Not Found</h2>
        
        {/* Message */}
        <p className="text-gray-600 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Back to Login Button */}
        <div className="pt-8">
          <button
            onClick={() => navigate('/login')}
            className="bg-primary text-white px-8 py-3 rounded-lg font-medium 
              transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 