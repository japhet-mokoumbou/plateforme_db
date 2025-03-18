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
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError('Erreur lors de la récupération du profil');
      }
    };
    fetchProfile();
  }, []);

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!user) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">
        Bienvenue, {user.username} !
      </h1>
      {user.is_professor ? (
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl">Tableau de bord Professeur</h2>
          <p>Gérez vos exercices et corrigez les soumissions.</p>
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl">Tableau de bord Étudiant</h2>
          <p>Soumettez vos exercices ici.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;