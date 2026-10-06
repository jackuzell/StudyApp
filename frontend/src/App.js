import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './css/styles.css'; 
import AuthForm from './components/AuthForm'; 
import NoteUpload from './components/NoteUpload';
import NoteList from './components/NoteList';
import QuizView from './components/QuizView';
import SummaryView from './components/SummaryView';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/api/notes`;

function App() {
  const [user, setUser] = useState(null); 
  const [notes, setNotes] = useState([]);
  const [quizData, setQuizData] = useState(null); 
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'summary' | 'quiz' | null
  const [selectedNoteId, setSelectedNoteId] = useState(null); 
  const [error, setError] = useState('');

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      headers: {
        'x-auth-token': token,
      }
    };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotes([]);
    setSummaryData(null);
    setQuizData(null);
    setSelectedNoteId(null);
    setError('');
  }, []);

  const fetchNotes = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setNotes([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(API_URL, headers);
      setNotes(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching notes:', err.response ? err.response.data : err.message);
      if (err.response?.status === 401) {
        handleLogout();
        setError('Your session has expired. Please sign in again.');
      } else {
        setError(err.response?.data?.message || 'Could not load your notes from server.');
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, handleLogout]);

  const generateSummary = useCallback(async (noteId) => {
    const headers = getAuthHeaders();
    if (!headers) {
      setError("Please log in to generate summaries.");
      return;
    }
    setLoading(true);
    setActionType('summary');
    setQuizData(null);
    setSummaryData(null);
    setError('');
    setSelectedNoteId(noteId);

    try {
      const response = await axios.get(`${API_URL}/${noteId}/summarize`, headers);
      setSummaryData(response.data);
      setError('');
      setTimeout(() => {
        document.getElementById('summary-view-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Summary Generation Error:', err.response ? err.response.data : err.message);
      setError(`Summary generation failed: ${err.response?.data?.message || 'Please check your connection and API key.'}`);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  }, [getAuthHeaders]);
  
  const generateQuiz = useCallback(async (noteId) => {
    const headers = getAuthHeaders();
    if (!headers) {
      setError("Please log in to generate quizzes.");
      return;
    }
    setLoading(true);
    setActionType('quiz');
    setQuizData(null);
    setSummaryData(null);
    setError('');
    setSelectedNoteId(noteId);

    try {
      const response = await axios.get(`${API_URL}/${noteId}/quiz`, headers);
      setQuizData(response.data);
      setTimeout(() => {
        document.getElementById('quiz-view-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Quiz Generation Error:', err.response ? err.response.data : err.message);
      setError(`Quiz generation failed: ${err.response?.data?.message || 'Please check your connection and API key.'}`);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  }, [getAuthHeaders]);

  const clearQuiz = () => {
    setQuizData(null);
    setSelectedNoteId(null);
  };

  const clearSummary = () => {
    setSummaryData(null);
    setSelectedNoteId(null);
  };

  const handleLogin = (userData) => {
    localStorage.setItem('token', userData.token);
    const userString = JSON.stringify(userData.user);
    localStorage.setItem('user', userString);
    setUser(userData.user);
    setError('');
    fetchNotes(); 
  };

  // Restore authenticated user on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser);
          fetchNotes();
        }
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [fetchNotes]);

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="app-shell">
      {/* Top Navigation Bar */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="brand">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <path d="M12 6v6"></path>
                <path d="M9 9h6"></path>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-title">StudySense AI</span>
            </div>
          </div>

          {user && (
            <div className="user-nav">
              <div className="user-profile">
                <div className="avatar-circle">
                  {getUserInitials(user.username)}
                </div>
                <div className="user-meta">
                  <span className="user-name">{user.username}</span>
                  <span className="user-email">{user.email || 'Online'}</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleLogout} 
                className="btn btn-ghost btn-sm logout-btn"
                title="Sign out of account"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-container">
        {error && (
          <div className="alert-banner alert-error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
            <button 
              type="button" 
              onClick={() => setError('')} 
              className="btn-close-alert"
            >
              ✕
            </button>
          </div>
        )}

        {user ? (
          <div className="dashboard-content">
            <div className="dashboard-header-intro">
              <h2>Welcome, {user.username} 👋</h2>
              <p>Upload lecture notes and generate key concept breakdowns or interactive practice tests instantly.</p>
            </div>

            <NoteUpload onUploadSuccess={fetchNotes} />

            <NoteList 
              notes={notes}
              loading={loading}
              actionType={actionType}
              selectedNoteId={selectedNoteId}
              onGenerateQuiz={generateQuiz}
              onGenerateSummary={generateSummary}
              fetchNotes={fetchNotes}
              getAuthHeaders={getAuthHeaders}
            />

            {/* Generated Quiz Section */}
            {quizData && (
              <QuizView 
                key={selectedNoteId || quizData.quiz_title}
                quizData={quizData}
                onClearQuiz={clearQuiz}
              />
            )}

            {/* Generated Summary Section */}
            {summaryData && (
              <SummaryView
                key={selectedNoteId || summaryData.title}
                summaryData={summaryData}
                onClearSummary={clearSummary}
              />
            )}
          </div>
        ) : (
          <AuthForm onLogin={handleLogin} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Built with MERN Stack & Google Gemini API • Designed for Student Productivity</p>
      </footer>
    </div>
  );
}

export default App;