import React, { useState, useEffect } from 'react';

function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter');
        return;
      }
      try {
        const response = await fetch('http://localhost:8000/api/submissions/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        } else {
          setError('Erreur lors du chargement des soumissions');
        }
      } catch (err) {
        setError('Erreur réseau : ' + err.message);
      }
    };
    fetchSubmissions();
  }, []);

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!submissions.length) return <div className="text-center">Aucune soumission pour l’instant</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Historique de vos soumissions</h2>
      {submissions.map((submission) => (
        <div key={submission.id} className="bg-white p-4 mb-4 rounded shadow-md">
          <h3 className="text-xl">{submission.exercise.title}</h3>
          <p>Date : {new Date(submission.submitted_at).toLocaleString()}</p>
          <p>Note : {submission.grade !== null ? submission.grade : 'Non évalué'} / 10</p>
          <p>Feedback : {submission.feedback || 'Aucun commentaire'}</p>
          {submission.content && <p>Réponse : {submission.content}</p>}
          {submission.file && <p>Fichier soumis : {submission.file.split('/').pop()}</p>}
        </div>
      ))}
    </div>
  );
}

export default SubmissionHistory;