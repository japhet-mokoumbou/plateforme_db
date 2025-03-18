import React, { useState } from 'react';

function Login({ onLoginSuccess }) {  // Ajoutez onLoginSuccess comme prop
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.access) {
        localStorage.setItem('token', data.access);  // Stocke le token
        setMessage(data.message);                    // Affiche le message
        onLoginSuccess();                            // Appelle la fonction pour rediriger
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Erreur réseau : ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Connexion</h2>
        <input
          className="w-full p-2 mb-4 border rounded"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Se connecter
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}

export default Login;