import React from 'react';

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Compondo suas músicas...',
  subtitle = 'Criando letras únicas e prompts otimizados para o Suno. Isso pode levar alguns segundos.',
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-12 text-center">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 border-4 border-dark-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-suno-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-4 bg-dark-800 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-suno-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 animate-pulse">{subtitle}</p>
    </div>
  );
};

export default LoadingState;