import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './css/styles.css'; 
import AuthForm from './components/AuthForm'; 
import NoteUpload from './components/NoteUpload';
import NoteList from './components/NoteList';
import QuizView from './components/QuizView';
import SummaryView from './components/SummaryView';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  const [user, setUser] = useState(null); 
  const [notes, setNotes] = useState([]);
  const [quizData, setQuizData] = useState(null); 
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null); 
  const [error, setError] = useState('');

  // Declare all your functions at the top, after state declarations
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      headers: {
        'x-auth-token': token,
      }
    };
  }, []);

  const fetchNotes = useCallback(async () => {
  const headers = getAuthHeaders();
  if (!headers) {
     setNotes([]);
      // Set a specific error message if the headers/token are missing
      setError('Authorization token missing. Please log in or sign up.'); 
      return;
}
setLoading(true);
   try {
    
   const response = await axios.get(API_URL, headers);
   setNotes(response.data);
   setError('');

   } catch (err) 
   {
   console.error('Error fetching notes:', err.response ? err.response.data : err.message);
      // The error below now primarily handles 'Token is not valid' (expiration)
   setError('Session expired or invalid. Please log in again.'); 
   } finally {
  setLoading(false);
   }
  }, [getAuthHeaders]);

  const generateSummary = useCallback(async (noteId) => {
    const headers = getAuthHeaders();
    if (!headers) {
        setError("You must be logged in to generate a summary.");
        return;
    }
    setLoading(true);
    setQuizData(null); // Clear quiz view if present
    setSummaryData(null); // Clear previous summary
    setError('');
    setSelectedNoteId(noteId);

    try {
      // Call the new backend endpoint for summarization
      const response = await axios.get(`${API_URL}/${noteId}/summarize`, headers);
      setSummaryData(response.data);
      setError('');
    } catch (err) {
      console.error('Summary Generation Error:', err.response ? err.response.data : err.message);
      setError(`Summary generation failed: ${err.response?.data?.message || 'Check API key/file type.'}`);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);
  
  const generateQuiz = useCallback(async (noteId) => {
    const headers = getAuthHeaders();
    if (!headers) {
        setError("You must be logged in to generate a quiz.");
        return;
    }
    setLoading(true);
    setQuizData(null);
    setSummaryData(null); // Clear summary view if present
    setError('');
    setSelectedNoteId(noteId);

    try {
      const response = await axios.get(`${API_URL}/${noteId}/quiz`, headers);
      setQuizData(response.data);
    } catch (err) {
      console.error('Quiz Generation Error:', err.response ? err.response.data : err.message);
      setError(`Quiz generation failed: ${err.response?.data?.message || 'Check API key/file type.'}`);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const clearQuiz = () => {
    setQuizData(null);
    setSelectedNoteId(null);
    setError('');
  };

   const clearSummary = () => {
    setSummaryData(null);
    setSelectedNoteId(null);
    setError('');
  };

  const handleLogin = (userData) => {
    localStorage.setItem('token', userData.token);
    const userString = JSON.stringify(userData.user);
    localStorage.setItem('user', userString);
    setUser(userData.user);
    fetchNotes(); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotes([]);
    setSummaryData(null);
    setQuizData(null); 
    setError('');
  };

  // can safely call fetchNotes inside this useEffect
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
        fetchNotes();
      }
    }
  }, [fetchNotes]);

  return (
     <div className="container">
      <h1>Study Helper App (MERN + AI)</h1>
      
      {user ? (
        <>
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <span>Welcome, **{user.username}**</span>
            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
              Logout
            </button>
          </div>
          <NoteUpload onUploadSuccess={fetchNotes} />
          <hr style={{ margin: '30px 0' }} />
          <NoteList 
            notes={notes}
            // Loading state applies if processing EITHER quiz OR summary
            loading={loading && (quizData === null && summaryData === null)}
            selectedNoteId={selectedNoteId}
            onGenerateQuiz={generateQuiz}
            // Pass the summary generation function
            onGenerateSummary={generateSummary}
            fetchNotes={fetchNotes}
            getAuthHeaders={getAuthHeaders}
          />
          
          {/* RENDER EITHER QUIZ OR SUMMARY VIEW, prioritizes one over the other */}
          {quizData && <QuizView 
            quizData={quizData}
            onClearQuiz={clearQuiz}
          />}
          
          {summaryData && <SummaryView
            summaryData={summaryData}
            onClearSummary={clearSummary}
          />}
          
        </>
      ) : (
        <AuthForm onLogin={handleLogin} />
      )}
      
      {error && <p className="message-box message-error">{error}</p>}
    </div>
  );
}

export default App;