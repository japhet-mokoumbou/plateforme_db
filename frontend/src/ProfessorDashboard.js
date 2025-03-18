import React, { useState, useEffect } from 'react';

function ProfessorDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');
  const [editSubmission, setEditSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter');
        return;
      }
      try {
        const response = await fetch('http://localhost:8000/api/professor/submissions/', {
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
  if (!submissions.length) return <div className="text-center">Aucune soumission pour l’instant</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des soumissions</h2>
      {submissions.map((submission) => (
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
      ))}
    </div>
  );
}

export default ProfessorDashboard;