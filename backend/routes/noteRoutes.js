const express = require('express');
const router = express.Router(); // creation of router object
const fs = require('fs').promises; // Use the promises API
const mongoose = require('mongoose');
const parsePDF = require('pdf-parse'); // extract text from pdf 
const { GoogleGenAI } = require('@google/genai');// sdk for Google GenAI
const auth = require('../middleware/auth'); // Import authentication middleware
const Note = require('../models/note'); // import the Note model
const upload = require('../middleware/upload');

// Initialize AI with options object
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const extractNoteText = async (note) => {
    const fileExtension = note.originalFileName.split('.').pop().toLowerCase();
    let noteText = '';

    try {
        await fs.access(note.filePath);
    } catch {
        throw new Error('Note file could not be found on the server. Please re-upload your note.');
    }

    if (fileExtension === 'pdf') {
        const dataBuffer = await fs.readFile(note.filePath);
        const data = await parsePDF(dataBuffer);
        noteText = data.text || '';
    } else if (fileExtension === 'txt') {
        noteText = await fs.readFile(note.filePath, 'utf-8');
    } else {
        throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
    }

    if (!noteText.trim()) {
        throw new Error('Note text is empty or could not be extracted (scanned documents without OCR text are not supported).');
    }
    return noteText;
};

// Route to handle file upload with multer error handling
router.post('/upload', auth, (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'File upload error' });
        }
        next();
    });
}, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file format. Please upload a PDF or TXT file.' });
    }
    try {
        const title = (req.body.title && req.body.title.trim())
            ? req.body.title.trim()
            : req.file.originalname.replace(/\.[^/.]+$/, "");

        const newNote = new Note({
            user: req.user.id,
            title: title,
            filePath: req.file.path,
            originalFileName: req.file.originalname
        });

        await newNote.save();
        res.status(201).json({ message: 'File uploaded successfully', note: newNote });
    } catch (error) {
        console.error('Upload error:', error);
        if (req.file) {
            try { await fs.unlink(req.file.path); } catch (e) {}
        }
        res.status(500).json({ message: 'Server error during file upload', error: error.message });
    }
});

// Generate Summary/Key Notes
router.get('/:noteId/summarize', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.noteId)) {
            return res.status(400).json({ message: 'Invalid note ID format.' });
        }

        const note = await Note.findOne({ _id: req.params.noteId, user: req.user.id });

        if (!note) {
            return res.status(404).json({ message: 'Note not found or you are not authorized to view it.' });
        }

        const noteText = await extractNoteText(note);

        // Prompt to the AI agent to generate key notes
        const prompt = `
You are an expert academic assistant specializing in distilling complex documents into concise key notes.
Analyze the study notes provided below and generate a summary structured as clear, concise, and easy-to-read bullet points.
The summary should focus only on the main concepts, key terminology, and essential facts. Do not include introductory or concluding conversational filler outside of the bullet points.

STUDY NOTES:
---
${noteText}
---
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const summaryText = response.text;
        res.json({ title: `${note.title} Key Notes`, summary: summaryText });
    } catch (error) {
        console.error('Summary generation error:', error);
        res.status(500).json({ message: error.message || 'Error generating summary from notes.' });
    }
});

// Route to generate quiz 
router.get('/:noteId/quiz', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.noteId)) {
            return res.status(400).json({ message: 'Invalid note ID format.' });
        }

        const note = await Note.findOne({ _id: req.params.noteId, user: req.user.id });

        if (!note) {
            return res.status(404).json({ message: 'Note not found or you are not authorized to view it.' });
        }

        const noteText = await extractNoteText(note);

        const prompt = `
You are an expert academic tutor. Analyze the study notes provided below and generate a 5-question multiple-choice quiz to test understanding.
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

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ text: prompt }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        quiz_title: {
                            type: "string",
                            description: "A short, descriptive title for the quiz"
                        },
                        questions: {
                            type: "array",
                            description: "An array of 5 quiz questions",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string" },
                                    options: {
                                        type: "object",
                                        properties: {
                                            A: { type: "string" },
                                            B: { type: "string" },
                                            C: { type: "string" },
                                            D: { type: "string" },
                                        },
                                    },
                                    correct_answer: { type: "string", enum: ["A", "B", "C", "D"] },
                                },
                                required: ["question", "options", "correct_answer"],
                            },
                        },
                    },
                    required: ["quiz_title", "questions"],
                },
            },
        });

        const quizData = JSON.parse(response.text);
        res.json(quizData);
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ message: error.message || 'Error generating quiz from notes.' });
    }
});

// Get all notes 
router.get('/', auth, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id }).sort({ uploadDate: -1 });
        res.json(notes);
    } catch (error) {
        console.error('Fetch Notes Error:', error);
        res.status(500).json({ message: 'Error fetching notes list.' });
    }
});

// Route to handle deleting a note
router.delete('/:noteId', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.noteId)) {
            return res.status(400).json({ message: 'Invalid note ID format.' });
        }

        const note = await Note.findOne({ _id: req.params.noteId, user: req.user.id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found or you are not authorized to delete it.' });
        }

        try {
            await fs.stat(note.filePath);
            await fs.unlink(note.filePath); 
        } catch (fileError) {
            if (fileError.code !== 'ENOENT') {
                console.warn('Error removing note file:', fileError.message);
            }
        }

        await Note.deleteOne({ _id: req.params.noteId });
        res.status(200).json({ message: 'Note deleted successfully.' });
    } catch (error) {
        console.error('Delete Note Error:', error);
        res.status(500).json({ message: error.message || 'Error deleting the note.' });
    }
});

module.exports = router;
