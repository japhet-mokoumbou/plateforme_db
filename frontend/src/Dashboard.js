import React, { useState, useEffect } from 'react';
import ExerciseList from './ExerciseList';
import SubmissionHistory from './SubmissionHistory';
import ProfessorDashboard from './ProfessorDashboard';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectedSql, setExpectedSql] = useState('');  // Nouveau champ
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

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
          setError('Session expirée');
          localStorage.removeItem('token');
        }
      } catch (err) {
        setError('Erreur réseau');
      }
    };
    fetchProfile();
  }, []);

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/exercises/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, expected_sql: expectedSql }),
      });
      if (response.ok) {
        setTitle('');
        setDescription('');
        setExpectedSql('');
        alert('Exercice créé !');
      }
    } catch (err) {
      setError('Erreur lors de la création');
    }
  };

  const handleSubmitExercise = async (e) => {
    e.preventDefault();
    if (!selectedExercise) {
      setError('Sélectionnez un exercice');
      return;
    }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('exercise', selectedExercise);
    if (submissionContent) formData.append('content', submissionContent);
    if (submissionFile) formData.append('file', submissionFile);

    try {
      const response = await fetch('http://localhost:8000/api/submissions/create/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setSubmissionContent('');
        setSubmissionFile(null);
        alert(`Soumission réussie ! Note : ${data.grade} - ${data.feedback}`);
      } else {
        setError(data.error || 'Erreur lors de la soumission');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
  };

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
        <>
          <div className="bg-white p-4 rounded shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-2">Créer un exercice</h2>
            <form onSubmit={handleCreateExercise}>
              <input
                className="w-full p-2 mb-4 border rounded"
                placeholder="Titre"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full p-2 mb-4 border rounded"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <textarea
                className="w-full p-2 mb-4 border rounded"
                placeholder="Requête SQL attendue (optionnel)"
                value={expectedSql}
                onChange={(e) => setExpectedSql(e.target.value)}
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Créer
              </button>
            </form>
          </div>
          <ProfessorDashboard />
        </>
      ) : (
        <>
          <div className="bg-white p-4 rounded shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-2">Soumettre un exercice</h2>
            <form onSubmit={handleSubmitExercise}>
              <select
                className="w-full p-2 mb-4 border rounded"
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                <option value="">Sélectionnez un exercice</option>
              </select>
              <textarea
                className="w-full p-2 mb-4 border rounded"
                placeholder="Votre requête SQL ou réponse (facultatif)"
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
              />
              <input
                type="file"
                className="w-full mb-4"
                onChange={(e) => setSubmissionFile(e.target.files[0])}
              />
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Soumettre
              </button>
            </form>
          </div>
          <ExerciseList onSelectExercise={(id) => setSelectedExercise(id)} />
          <SubmissionHistory />
        </>
      )}
    </div>
  );
}

export default Dashboard;