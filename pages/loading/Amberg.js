import { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 Sekunde
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: isLoading ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#fafafa',
      fontSize: '2rem',
      fontWeight: 'bold',
    }}>
      <span style={{
        background: 'linear-gradient(to right, #4372b7, #905fa4)', // Blau -> Lila
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent'
      }}>
        Loading
      </span>
    </div>
  );
};

export default LoadingScreen;
