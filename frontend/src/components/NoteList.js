import React, {useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notes';

const NoteList = ({onGenerateQuiz, selectedNoteId, loading, fetchNotes}) => {
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState('');

    //fucntion to fetch notes from the backend
    const refreshNotes = useCallback(async () => {
        try{
            const response = await axios.get(API_URL);
            setNotes(response.data);
            setError('');
        }catch(err){
            console.error('Error fetching notes:', err);
            setError('Failed to fetch notes. Please try again later.');
        }
    },[]);

    useEffect(() => {
        fetchNotes();
    },[fetchNotes]);

    return(
        <div className="note-list-section">
            <h2>Your Uploaded Notes</h2>
            {loading && !notes.length && <p>Loading notes...</p>}
            {error && <p className="message-box message-error">{error}</p>}

            {notes.length ===0 && !loading && !error && <p> No notes uploaded yet. Upload a file to begin!</p>}

            <ul style= {{padding: 0 }}>
                {notes.map(note => {
                    const isSelected = note._id === selectedNoteId;
                    return(
                        <li 
                            key={note._id}
                            className={`note-list-item ${isSelected ? 'selected' : ''}`}
                            >
                            <div className="note-details">
                                <strong>{note.title}</strong> ({note.originalFileName})
                                <p>Uploaded: {new Date(note.uploadDate).toLocaleDateString()}</p>
                            </div>

                            <button onClick={() => onGenerateQuiz(note._id)}
                                disabled={loading}
                            >
                                {loading && isSelected ? 'Generating Quiz...' : 'Generate Quiz'}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export default NoteList;