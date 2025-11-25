import React from 'react';
import { AuthProvider } from '../types';

interface LoginModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  onLogin: (provider: AuthProvider) => void 
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  const handleLogin = (provider: AuthProvider) => {
    onLogin(provider);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-500 mb-6">Sign in to save your chat history.</p>
        
        <div className="space-y-3">
          <button 
            onClick={() => handleLogin(AuthProvider.GOOGLE)}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          
          <button 
            onClick={() => handleLogin(AuthProvider.FACEBOOK)}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#1864D9] text-white font-medium py-3 px-4 rounded-xl transition-all"
          >
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continue with Facebook
          </button>
          
          <button 
            onClick={() => handleLogin(AuthProvider.APPLE)}
            className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.48-1.23 3.93-1.14 1.35.08 2.39.84 2.84 1.42-2.73 1.4-2.3 5.48.51 6.71-.35 1.13-1.09 2.93-2.36 5.24zm3.03-15.65c.57-1.18.33-2.83-.88-4.04-1.29-1.07-3.08-.68-3.8.37-.53 1.05-.22 2.76 1.05 4.04 1.19 1.06 2.87.67 3.63-.37z"/></svg>
            Continue with Apple
          </button>
        </div>
        <button onClick={onClose} className="mt-6 text-sm text-gray-500 hover:text-gray-900 w-full text-center">
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
