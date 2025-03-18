import React, { useState } from 'react';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProfessor, setIsProfessor] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, is_professor: isProfessor, is_student: !isProfessor }),
      });
      const data = await response.json();
      if (data.access) {
        localStorage.setItem('token', data.access);
        setMessage(data.message);
      } else {
        setMessage(data.error || 'Erreur lors de l’inscription');
      }
    } catch (error) {
      setMessage('Erreur réseau : ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Inscription</h2>
        <input
          className="w-full p-2 mb-4 border rounded"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={isProfessor}
            onChange={(e) => setIsProfessor(e.target.checked)}
            className="mr-2"
          />
          Je suis professeur
        </label>
        <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
          S’inscrire
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}

export default Register;