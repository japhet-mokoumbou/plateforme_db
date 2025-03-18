import React, { useState, useEffect } from 'react';

function StudentStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter');
        return;
      }
      try {
        const response = await fetch('http://localhost:8000/api/stats/student/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Erreur lors du chargement des statistiques');
        }
      } catch (err) {
        setError('Erreur réseau : ' + err.message);
      }
    };
    fetchStats();
  }, []);

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!stats) return <div className="text-center">Chargement...</div>;

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Vos statistiques</h2>
      <p>Total des soumissions : {stats.total_submissions}</p>
      <p>Note moyenne : {stats.average_grade.toFixed(2)} / 10</p>
      <p>Exercices complétés : {stats.completed_exercises}</p>
    </div>
  );
}

export default StudentStats;