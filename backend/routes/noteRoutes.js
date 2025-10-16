const express = require('express');
const router = express.Router(); // creation of router object
const fs = require('fs').promises; // FIX: Use the promises API
const parsePDF = require('pdf-parse'); // extract text from pdf 
const { GoogleGenAI } = require('@google/genai');// sdk for Google GenAI
const auth = require('../middleware/auth'); // Import authentication middleware
const Note = require('../models/note'); // import the Note model
const upload = require('../middleware/upload');

//Initilize AI
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);


const extractNoteText = async (note) => {
    const fileExtension = note.originalFileName.split('.').pop().toLowerCase();
    let noteText = '';

    if (fileExtension === 'pdf') {
        const dataBuffer = await fs.readFile(note.filePath);
        const data = await parsePDF(dataBuffer);
        noteText = data.text;
    } else if (fileExtension === 'txt') {
        noteText = await fs.readFile(note.filePath, 'utf-8');
    } else {
        throw new Error('Unsupported file type');
    }

    if (!noteText.trim()) {
        throw new Error('Note text is empty or could not be extracted');
    }
    return noteText;
};

// Route to handle file upload
router.post('/upload', auth, upload, async(req, res) => {
    if(!req.file){
        return res.status(400).json({error: 'No file uploaded or invalid file type'});
    }
    try {
        // Create a new note document in the database
        const newNote = new Note({
            // Link the note to the authenticated user
            user: req.user.id,
            title: req.body.title,
            filePath: req.file.path,
            originalFileName: req.file.originalname
        });

        await newNote.save(); // Save the note to the database

        res.status(201).json({message: 'File uploaded successfully', note: newNote});
    } catch (error) {
        console.error('Upload error:', error);
        if(req.file){
            await fs.unlink(req.file.path); // Delete the uploaded file if there's an error
        }
        res.status(500).json({error: 'Server error during file upload'});
    }
});

//Generate Summary/Key Notes
router.get('/:noteId/summarize', auth, async(req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.noteId, user: req.user.id });

        if(!note) {
            return res.status(404).json({message: 'Note not found or you are not authorized to view it.'});
        }

        const noteText = await extractNoteText(note);

        // Prompt to the AI agent to generate key notes
         const prompt = `
            You are an expert academic assistant specializing in distilling complex documents into concise key notes.
            Analyze the study notes provided below and generate a summary structured as clear, concise, and easy-to-read bullet points.
            The summary should focus only on the main concepts and facts. Do not include any introductory or concluding sentences outside of the bullet points.
            
            STUDY NOTES:
            ---
            ${noteText}
            ---
            `;
        
        const response = await ai.models.generateContent({
            model:"gemini-2.5-flash",
            // Using the full content object structure for safety
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const summaryText = response.text;

        // Send the summary back as plain text
        res.json({ title: `${note.title} Key Notes`, summary: summaryText });
        
    } catch(error) {
        console.error('Summary generation error:', error);
        // Ensure the error response is formatted correctly for the frontend
        res.status(500).json({message: 'Error generating summary from notes.', error: error.message});
    }
});


// Route to generate quiz 
router.get('/:noteId/quiz', auth, async(req, res) => {
    try {
        // Find the note and ensure it belongs to the authenticated user
        const note = await Note.findOne({ _id: req.params.noteId, user: req.user.id });

        if(!note)
        {
            return res.status(404).json({message: 'Note not found or you are not authorized to view it.'});
        }

        const noteText = await extractNoteText(note);

        //Prompt to the ai agent 
         const prompt = `
            You are an expert academic assistant. Analyze the study notes provided below and generate a 5-question multiple-choice quiz.
            The quiz must be returned as a single JSON object.
            Each question object in the 'questions' array must have:
            1. 'question': The quiz question string.
            2. 'options': An object with keys 'A', 'B', 'C', 'D' and their corresponding option text.
            3. 'correct_answer': The letter ('A', 'B', 'C', or 'D') of the correct option.
            
            STUDY NOTES:
            ---
            ${noteText}
            ---
            `;
        
        //CALL ai agent for output 
        const response = await ai.models.generateContent({
            model:"gemini-2.5-flash",
            contents: [{ text: prompt }],
            config: {
                responseMimeType: "application/json", // requests it in json format
                responseSchema: {
                    type: "object",
                    properties: {
                        quiz_title: {
                            type: "string",
                            description: "A short, descriptive title for the quiz"
                        },
                        questions: {
                            type:"array",
                            description: "An array of 5 quiz questions",
                            items:{
                                type: "object",
                                properties: {
                                    question: {type: "string"},
                                    options: {
                                        type: "object",
                                        properties:{
                                            A: { type: "string"},
                                            B: { type: "string"},
                                            C: { type: "string"},
                                            D: { type: "string"},
                                        },
                                    },
                                    correct_answer :{ type: "string", enum: ["A", "B", "C", "D"]},
                                },
                                required:["question", "options", "correct_answer"],
                            },
                        },
                    },
                    required : ["quiz_title", "questions"],
                },
            },
        });

        const quizData = JSON.parse(response.text);

        //send quiz to frontend
        res.json(quizData);
    } catch(error) {
        console.error('Quiz geneation error:', error);
        res.status(500).json({message: 'Error generating quiz from notes.', error: error.message});
    }
});

//Get all notes 
router.get('/', auth, async(req,res) => {
    try{
        const notes = await Note.find({ user: req.user.id }).sort({ uploadDate: -1 });
        res.json(notes);
    } catch(error) {
        console.error('Fetch Notes Error:', error);
        res.status(500).json({message: 'Error fetching notes list.'});
    }
});

// Route to handle deleting a note
router.delete('/:noteId', auth, async(req, res) => {
    try {
        // Find the note and ensure it belongs to the authenticated user
        const note = await Note.findOne({ _id: req.params.noteId, user: req.user.id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found or you are not authorized to delete it.' });
        }

        // Add a check to see if the file exists before trying to delete it
        try {
            await fs.stat(note.filePath);
            await fs.unlink(note.filePath); 
        } catch (fileError) {
            if (fileError.code === 'ENOENT') {
                console.warn('File not found, but proceeding with database deletion:', note.filePath);
            } else {
                throw fileError;
            }
        }

        // Use the static method on the Note model
        await Note.deleteOne({ _id: req.params.noteId });

        res.status(200).json({ message: 'Note deleted successfully.' });
    } catch (error) {
        console.error('Delete Note Error:', error);
        res.status(500).json({ message: 'Error deleting the note.', error: error.message });
    }
});

module.exports = router;
