import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/notes`;

const NoteList = ({ 
  notes, 
  onGenerateQuiz, 
  onGenerateSummary, 
  selectedNoteId, 
  loading, 
  actionType, // 'summary' | 'quiz' | null
  fetchNotes, 
  getAuthHeaders 
}) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this study note?')) {
      return;
    }

    setDeletingId(noteId);
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_URL}/${noteId}`, headers);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert(error.response?.data?.message || 'Failed to delete note');
    } finally {
      setDeletingId(null);
    }
  };

  const getFileBadge = (filename) => {
    const ext = filename?.split('.').pop().toUpperCase() || 'DOC';
    return <span className={`file-badge file-badge-${ext.toLowerCase()}`}>{ext}</span>;
  };

  return (
    <div className="card note-list-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="icon-badge icon-badge-neutral">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div>
            <h3>Your Study Materials</h3>
            <p className="card-subtitle">
              {notes.length === 1 ? '1 document uploaded' : `${notes.length} documents uploaded`}
            </p>
          </div>
        </div>
      </div>

      {loading && !notes.length && (
        <div className="state-empty-box">
          <div className="spinner-md"></div>
          <p>Loading your notes library...</p>
        </div>
      )}

      {notes.length === 0 && !loading && (
        <div className="state-empty-box">
          <div className="empty-icon-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
          </div>
          <h4>No study notes uploaded yet</h4>
          <p>Upload a lecture slide PDF or reading text above to generate AI summaries and quizzes.</p>
        </div>
      )}

      {notes.length > 0 && (
        <div className="notes-grid">
          {notes.map(note => {
            const isSelected = note._id === selectedNoteId;
            const isNoteProcessing = loading && isSelected;
            const isSummarizing = isNoteProcessing && actionType === 'summary';
            const isGeneratingQuiz = isNoteProcessing && actionType === 'quiz';
            const isDeleting = deletingId === note._id;

            return (
              <div 
                key={note._id} 
                className={`note-item-card ${isSelected ? 'note-item-active' : ''}`}
              >
                <div className="note-card-main">
                  <div className="note-meta-top">
                    {getFileBadge(note.originalFileName)}
                    <span className="note-date">
                      {new Date(note.uploadDate).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  <h4 className="note-title">{note.title}</h4>
                  <p className="note-filename" title={note.originalFileName}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    {note.originalFileName}
                  </p>
                </div>

                <div className="note-card-actions">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => onGenerateSummary(note._id)}
                    disabled={loading || isDeleting}
                    title="Generate key summary bullets"
                  >
                    {isSummarizing ? (
                      <span className="btn-spinner-content">
                        <span className="spinner-xs"></span>
                        Summarizing...
                      </span>
                    ) : (
                      <span>⚡ Key Notes</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onGenerateQuiz(note._id)}
                    disabled={loading || isDeleting}
                    title="Generate a 5-question multiple choice quiz"
                  >
                    {isGeneratingQuiz ? (
                      <span className="btn-spinner-content">
                        <span className="spinner-xs"></span>
                        Generating...
                      </span>
                    ) : (
                      <span>🎯 AI Quiz</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteNote(note._id, e)}
                    disabled={loading || isDeleting}
                    className="btn btn-ghost-danger btn-sm btn-icon-only"
                    title="Delete Note"
                  >
                    {isDeleting ? (
                      <span className="spinner-xs"></span>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NoteList;