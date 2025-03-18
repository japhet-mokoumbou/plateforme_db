import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

function App() {
  const [page, setPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPage('login');
  };

  return (
    <div>
      <nav className="bg-blue-500 p-4 text-white flex justify-between">
        <div>
          <button onClick={() => setPage('login')} className="mr-4">Connexion</button>
          <button onClick={() => setPage('register')} className="mr-4">Inscription</button>
          {isAuthenticated && (
            <button onClick={() => setPage('dashboard')} className="mr-4">Tableau de bord</button>
          )}
        </div>
        {isAuthenticated && (
          <button onClick={handleLogout} className="bg-red-500 px-4 py-1 rounded hover:bg-red-600">
            Déconnexion
          </button>
        )}
      </nav>
      {page === 'login' && <Login onLoginSuccess={handleLoginSuccess} />}
      {page === 'register' && <Register />}
      {page === 'dashboard' && isAuthenticated ? <Dashboard /> : page === 'dashboard' && <Login onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
}

export default App;