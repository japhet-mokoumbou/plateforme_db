import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ProfessorDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');
  const [editSubmission, setEditSubmission] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter');
        return;
      }
      try {
        const subResponse = await fetch('http://localhost:8000/api/professor/submissions/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const statsResponse = await fetch('http://localhost:8000/api/stats/professor/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (subResponse.ok && statsResponse.ok) {
          const subData = await subResponse.json();
          const statsData = await statsResponse.json();
          setSubmissions(subData);
          setStats(statsData);
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
    labels: stats.map(stat => stat.exercise_title),
    datasets: [
      {
        label: 'Note moyenne',
        data: stats.map(stat => stat.average_grade),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
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
      title: { display: true, text: 'Notes moyennes par exercice' },
    },
  };

  const handleUpdate = async (submissionId) => {
    const token = localStorage.getItem('token');
    const updatedSubmission = submissions.find(s => s.id === submissionId);
    try {
      const response = await fetch(`http://localhost:8000/api/submissions/${submissionId}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade: updatedSubmission.grade,
          feedback: updatedSubmission.feedback,
        }),
      });
      if (response.ok) {
        setEditSubmission(null);
        alert('Soumission mise à jour !');
      } else {
        setError('Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
  };

  const handleGradeChange = (submissionId, value) => {
    setSubmissions(submissions.map(sub => 
      sub.id === submissionId ? { ...sub, grade: parseFloat(value) || sub.grade } : sub
    ));
  };

  const handleFeedbackChange = (submissionId, value) => {
    setSubmissions(submissions.map(sub => 
      sub.id === submissionId ? { ...sub, feedback: value } : sub
    ));
  };

  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des soumissions</h2>
      {stats.length > 0 && (
        <div className="bg-white p-4 mb-6 rounded shadow-md">
          <h3 className="text-xl font-semibold mb-2">Statistiques des exercices</h3>
          <Bar data={chartData} options={chartOptions} />
          {stats.map((stat, index) => (
            <div key={index} className="mt-4">
              <p><strong>{stat.exercise_title}</strong></p>
              <p>Total des soumissions : {stat.total_submissions}</p>
              <p>Note moyenne : {stat.average_grade.toFixed(2)} / 10</p>
              <p>Taux de réussite : {stat.success_rate.toFixed(2)}%</p>
            </div>
          ))}
        </div>
      )}
      {submissions.length === 0 ? (
        <div className="text-center">Aucune soumission pour l’instant</div>
      ) : (
        submissions.map((submission) => (
          <div key={submission.id} className="bg-white p-4 mb-4 rounded shadow-md">
            <h3 className="text-xl">{submission.exercise.title}</h3>
            <p>Étudiant : {submission.student.username}</p>
            <p>Date : {new Date(submission.submitted_at).toLocaleString()}</p>
            {submission.content && <p>Réponse : {submission.content}</p>}
            {submission.file && <p>Fichier : {submission.file.split('/').pop()}</p>}
            {editSubmission === submission.id ? (
              <div>
                <input
                  type="number"
                  value={submission.grade || ''}
                  onChange={(e) => handleGradeChange(submission.id, e.target.value)}
                  className="w-20 p-2 mb-2 border rounded"
                  min="0"
                  max="10"
                  step="0.1"
                />
                <textarea
                  value={submission.feedback || ''}
                  onChange={(e) => handleFeedbackChange(submission.id, e.target.value)}
                  className="w-full p-2 mb-2 border rounded"
                />
                <button
                  onClick={() => handleUpdate(submission.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Sauvegarder
                </button>
              </div>
            ) : (
              <div>
                <p>Note : {submission.grade !== null ? submission.grade : 'Non évalué'} / 10</p>
                <p>Feedback : {submission.feedback || 'Aucun commentaire'}</p>
                <button
                  onClick={() => setEditSubmission(submission.id)}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ProfessorDashboard;