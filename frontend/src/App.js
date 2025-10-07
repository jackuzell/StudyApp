import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Import the  stylesheet
import './css/styles.css'; 

import NoteUpload from './components/NoteUpload';
import NoteList from './components/NoteList';
import QuizView from './components/QuizView';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [quizData, setQuizData] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null); 
  const [error, setError] = useState('');

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


  const generateQuiz = async (noteId) => {
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
    <div className="container">
      <h1>Study Helper App (MERN + AI)</h1>
      

      <NoteUpload onUploadSuccess={fetchNotes} />
      
      <hr style={{ margin: '30px 0' }} />

      
      <NoteList 
        notes={notes}
        loading={loading && !quizData}
        selectedNoteId={selectedNoteId}
        onGenerateQuiz={generateQuiz}
      />

      
      <QuizView 
        quizData={quizData}
        onClearQuiz={clearQuiz}
      />

      
      {error && <p className="message-box message-error">{error}</p>}
    </div>
  );
}

export default App;


