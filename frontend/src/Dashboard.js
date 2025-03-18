import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter');
        return;
      }
      try {
        const response = await fetch('http://localhost:8000/api/profile/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setError('Session expirée, veuillez vous reconnecter');
          localStorage.removeItem('token');
        }
      } catch (err) {
        setError('Erreur réseau : ' + err.message);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError('Déconnexion réussie');
  };

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!user) return <div className="text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bienvenue, {user.username} !</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Déconnexion
        </button>
      </div>
      {user.is_professor ? (
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-2">Tableau de bord Professeur</h2>
          <p>Gérez vos exercices et corrigez les soumissions.</p>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Créer un exercice
          </button>
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-2">Tableau de bord Étudiant</h2>
          <p>Soumettez vos exercices ici.</p>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Soumettre un exercice
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;