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
}
