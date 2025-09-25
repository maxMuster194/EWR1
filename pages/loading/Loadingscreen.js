import { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: isLoading ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#fafafa',
      color: '#063d37',
      fontSize: '2rem',
      fontWeight: 'bold',
    }}>
      Loading
    </div>
  );
};

export default LoadingScreen;