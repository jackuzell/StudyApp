const express = require('express');
const router = express.Router(); // creation of router object
const fs = require('fs').promises;
const parsePDF = require('pdf-parse'); // extract text from pdf 
const { GoogleGenAI } = require('@google/genai');// sdk for Google GenAI


//Middleware and model
const upload = require('../middleware/upload'); // import the multer middleware for file uploads
const Note = require('../models/note'); // import the Note model
const auth = require('../middleware/auth'); // import the auth middleware


//Initilize AI
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Route to handle file upload
router.post('/upload', upload, async(req, res) => {
    if(!req.file){
        return res.status(400).json({error: 'No file uploaded or invalid file type'});
    }
    try {
        // Create a new note document in the database
        const newNote = new Note({
            user: req.user.id, 
            title: req.body.title,
            filePath: req.file.path,
            originalFileName: req.file.originalname
        });

        await newNote.save(); // Save the note to the database

        res.status(201).json({message: 'File uploaded successfully', note: newNote});
    } catch (error) {
        console.error('Upload error:', error);
        await fs.unlink(req.file.path); // Delete the uploaded file if there's an error
        res.status(500).json({error: 'Server error during file upload'});
    }
});

//Route to delete a note
router.delete('/:noteId', auth, async(req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.noteId, user: req.user.id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found.' });
        }

        
        try {
            await fs.stat(note.filePath); // Check if the file exists
            await fs.unlink(note.filePath); // Delete the file if it exists
        } catch (fileError) {
            if (fileError.code === 'ENOENT') {
                console.warn('File not found, but proceeding with database deletion:', note.filePath);
            } else {
                throw fileError; // Re-throw other errors
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


// Route to generate quiz
router.get('/:noteId/quiz', async(req, res) => {
    try {
        // Find the note and ensure it belongs to the authenticated user
        const note = await Note.findOne({ _id: req.params.noteId, user: req.user.id });

        if(!note)
        {
            return res.status(404).json({message: 'Note not found or you are not authorized to view it.'});
        }

        let noteText = '';
        const fileExtension = note.originalFileName.split('.').pop().toLowerCase();
        // Extract text based on file type
        if(fileExtension === 'pdf')
        {
            const dataBuffer = await fs.readFile(note.filePath);//Read file
            const data = await parsePDF(dataBuffer);//parse to extract text
            noteText = data.text;
        } else if(fileExtension === 'txt') // can read directly 
        {
            noteText = await fs.readFile(note.filePath, 'utf-8');
        }else{
            return res.status(400).json({message: 'Unsupported file type'});
        }

        if(!noteText.trim())
        {
            return res.status(400).json({message: 'Note text is empty or could not be extracted'});
        }

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
            contents: prompt,
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
router.get('/', async(req,res) => {
    try{ //Maybe add in filter by user id here later 
        const notes = await (await Note.find({user: req.user.id})).sort({uploadDate: -1});
        res.json(notes);
    } catch(error) {
        console.error('Fetch Notes Error:', error);
        res.status(500).json({message: 'Error fetching notes list.'});
    }
});

module.exports = router;