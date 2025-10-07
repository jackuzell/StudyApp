// frontend/src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Import the global stylesheet
import './css/styles.css'; 

import NoteUpload from './components/NoteUpload';
import NoteList from './components/NoteList';
import QuizView from './components/QuizView';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  // State definitions remain the same...
  const [notes, setNotes] = useState([]);
  const [quizData, setQuizData] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null); 
  const [error, setError] = useState('');

  // --- Fetch Notes Logic (remains the same) ---
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setNotes(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Could not fetch notes list. Check backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);


  // --- Quiz Generation Logic (remains the same) ---
  const generateQuiz = async (noteId) => {
    // ... (logic remains the same)
    setLoading(true);
    setQuizData(null);
    setError('');
    setSelectedNoteId(noteId);

    try {
      const response = await axios.get(`${API_URL}/${noteId}/quiz`);
      setQuizData(response.data);
    } catch (err) {
      console.error('Quiz Generation Error:', err.response ? err.response.data : err.message);
      setError(`Quiz generation failed: ${err.response?.data?.message || 'Check API key/file type.'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearQuiz = () => {
    setQuizData(null);
    setSelectedNoteId(null);
    setError('');
  };

  return (
    // Apply the 'container' class defined in styles.css
    <div className="container">
      <h1>Study Helper App (MERN + AI)</h1>
      
      {/* 1. Note Upload Section */}
      <NoteUpload onUploadSuccess={fetchNotes} />
      
      <hr style={{ margin: '30px 0' }} />

      {/* 2. Note List Section */}
      <NoteList 
        notes={notes}
        loading={loading && !quizData}
        selectedNoteId={selectedNoteId}
        onGenerateQuiz={generateQuiz}
      />

      {/* 3. Quiz View Section */}
      <QuizView 
        quizData={quizData}
        onClearQuiz={clearQuiz}
      />

      {/* Display a general error message if one exists */}
      {error && <p className="message-box message-error">{error}</p>}
    </div>
  );
}

export default App;


