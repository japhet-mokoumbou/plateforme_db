import React, { useState, useEffect } from 'react';

function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExercises = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8000/api/exercises/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        setExercises(data);
      } catch (err) {
        setError('Erreur lors du chargement des exercices');
      }
    };
    fetchExercises();
  }, []);

  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Exercices disponibles</h2>
      {exercises.map((exercise) => (
        <div key={exercise.id} className="bg-white p-4 mb-4 rounded shadow-md">
          <h3 className="text-xl">{exercise.title}</h3>
          <p>{exercise.description}</p>
          <p className="text-gray-500">Créé par : {exercise.created_by.username}</p>
        </div>
      ))}
    </div>
  );
}

export default ExerciseList;