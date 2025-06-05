import React, { useState } from 'react';
import '../css/style2.css'; 

const Connexion = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [messageColor, setMessageColor] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();

    if (username === 'admin' && password === '1234') {
      setMessageColor('#00ff00');
      setLoginMessage('Connexion réussie !');
      // Exemple de redirection après 1.5s
      setTimeout(() => {
        window.location.href = '/home';
      }, 1500);
    } else {
      setMessageColor('#ff4444');
      setLoginMessage('Nom d’utilisateur ou mot de passe incorrect.');
    }
  };

  return (
    <>
      <div className="connexion-background"></div>
      <div className="connexion-container">
        <img
          src="https://zupimages.net/up/25/15/8td3.png"
          alt="Logo"
          className="connexion-logo"
        />
        <form className="connexion-form" onSubmit={handleLogin}>
          <h2>Connexion</h2>
          <input
            type="text"
            id="username"
            placeholder="Nom d'utilisateur"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            id="password"
            placeholder="Mot de passe"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Se connecter</button>
          <p
            id="login-message"
            className="login-message"
            style={{ color: messageColor }}
          >
            {loginMessage}
          </p>
        </form>
      </div>
    </>
  );
};

export default Connexion;