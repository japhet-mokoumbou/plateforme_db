import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

function App() {
  const [page, setPage] = useState('login');

  return (
    <div>
      <nav className="bg-blue-500 p-4 text-white">
        <button onClick={() => setPage('login')} className="mr-4">Connexion</button>
        <button onClick={() => setPage('register')} className="mr-4">Inscription</button>
        <button onClick={() => setPage('dashboard')}>Tableau de bord</button>
      </nav>
      {page === 'login' && <Login />}
      {page === 'register' && <Register />}
      {page === 'dashboard' && <Dashboard />}
    </div>
  );
}

export default App;