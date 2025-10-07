import React from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notes';

const NoteList = ({ notes, onGenerateQuiz, selectedNoteId, loading, fetchNotes }) => {

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation(); // Prevents clicking the parent element
    try {
      await axios.delete(`${API_URL}/${noteId}`);
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
          return (
            <li 
              key={note._id} 
              className={`note-list-item ${isSelected ? 'selected' : ''}`}
            >
              <div className="note-details">
                <strong>{note.title}</strong> ({note.originalFileName})
                <p>Uploaded: {new Date(note.uploadDate).toLocaleDateString()}</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => onGenerateQuiz(note._id)}
                  disabled={loading}
                >
                  {loading && isSelected ? 'Generating...' : 'Generate AI Quiz'}
                </button>
                <button
                  onClick={(e) => handleDeleteNote(note._id, e)}
                  style={{ marginLeft: '10px', backgroundColor: '#dc3545' }}
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