import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoaderUI from '../web/jsx/chargement.jsx';

const Loader = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 4; // avance de 4% par 200ms → ~5s total
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate('/connexion'); // redirection après 100%
          }, 500); // petit délai de confort
        }
        return next;
      });
    }, 200); // toutes les 200 ms

    return () => clearInterval(interval);
  }, [navigate]);

  return <LoaderUI progress={progress} />;
};

export default Loader;