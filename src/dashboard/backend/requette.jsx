import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoaderUI from '../web/jsx/chargement.jsx';

const Loader = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 4;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate('/connexion');
          }, 500);
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [navigate]);

  return <LoaderUI progress={progress} />;
};

export default Loader;