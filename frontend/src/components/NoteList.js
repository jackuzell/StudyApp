import React from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notes';

const NoteList = ({ notes, onGenerateQuiz, onGenerateSummary, selectedNoteId, loading, fetchNotes, getAuthHeaders }) => {

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation(); // Prevents clicking the parent element
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_URL}/${noteId}`,headers);
      fetchNotes(); // Re-fetch the list to show the updated notes
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="note-list-section">
      <h2>Your Uploaded Notes </h2>
      {loading && !notes.length && <p>Loading notes...</p>}
      
      {notes.length === 0 && !loading && <p>No notes uploaded yet. Upload a file to begin!</p>}

      <ul style={{ padding: 0 }}>
        {notes.map(note => {
          const isSelected = note._id === selectedNoteId;
          const isProcessing = loading && isSelected;
          return (
            <li 
              key={note._id} 
              className={`note-list-item ${isSelected ? 'selected' : ''}`}
            >
              <div className="note-details">
                <strong>{note.title}</strong> ({note.originalFileName})
                <p>Uploaded: {new Date(note.uploadDate).toLocaleDateString()}</p>
              </div>
              
              <div className="note-actions"> 
                {/* Summary button */}
                <button
                  onClick={() => onGenerateSummary(note._id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Summarizing...' : 'Generate Key Notes'}
                </button>
                
                {/*  Quiz Button */}
                <button
                  onClick={() => onGenerateQuiz(note._id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Generating...' : 'Generate AI Quiz'}
                </button>
                
                {/* Delte button */}
                <button
                  onClick={(e) => handleDeleteNote(note._id, e)}
                  disabled={isProcessing}
                  className="delete-btn" 
                >
                  Delete
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  );
};

export default NoteList;