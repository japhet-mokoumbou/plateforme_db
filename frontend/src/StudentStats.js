import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function StudentStats() {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter');
        return;
      }
      try {
        const statsResponse = await fetch('http://localhost:8000/api/stats/student/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const submissionsResponse = await fetch('http://localhost:8000/api/submissions/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (statsResponse.ok && submissionsResponse.ok) {
          const statsData = await statsResponse.json();
          const submissionsData = await submissionsResponse.json();
          setStats(statsData);
          setSubmissions(submissionsData);
        } else {
          setError('Erreur lors du chargement des données');
        }
      } catch (err) {
        setError('Erreur réseau : ' + err.message);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: submissions.map(sub => new Date(sub.submitted_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Notes',
        data: submissions.map(sub => sub.grade || 0),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Progression des notes' },
    },
  };

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!stats) return <div className="text-center">Chargement...</div>;

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Vos statistiques</h2>
      <p>Total des soumissions : {stats.total_submissions}</p>
      <p>Note moyenne : {stats.average_grade.toFixed(2)} / 10</p>
      <p>Exercices complétés : {stats.completed_exercises}</p>
      {submissions.length > 0 && (
        <div className="mt-6">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}

export default StudentStats;