import React, { useState, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// Base URL for backend API
const API_URL = `${API_BASE_URL}/api/notes`;

const NoteUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files && e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!title) {
                // Auto-suggest title based on filename
                setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];
        if (droppedFile) {
            const ext = droppedFile.name.split('.').pop().toLowerCase();
            if (ext === 'pdf' || ext === 'txt') {
                setFile(droppedFile);
                if (!title) {
                    setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
                }
            } else {
                setMessage('Error: Only PDF and TXT files are supported.');
            }
        }
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return {
            headers: {
                'x-auth-token': token,
            }
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a PDF or TXT file to upload.');
            return;
        }

        const headers = getAuthHeaders();
        if (!headers) {
            setMessage('Upload failed: Authorization token missing. Please sign in again.');
            return;
        }

        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('noteFile', file);
        formData.append('title', title.trim() || file.name);

        try {
            const response = await axios.post(`${API_URL}/upload`, formData, headers);
            setMessage(`Success: ${response.data.message || 'Note uploaded successfully!'}`);
            
            // Clean up state and clear visual file input
            setFile(null);
            setTitle('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setTimeout(() => setMessage(''), 4000);
            onUploadSuccess();
        } catch (error) {
            console.error('Upload error:', error.response ? error.response.data : error.message);
            setMessage(`Upload failed: ${error.response?.data?.message || 'Server error uploading file'}`);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const isSuccess = message.startsWith('Success');

    return (
        <div className="card upload-card">
            <div className="card-header">
                <div className="card-title-group">
                    <div className="icon-badge icon-badge-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </div>
                    <div>
                        <h3>Upload Study Material</h3>
                        <p className="card-subtitle">Upload lecture slides, notes, or readings in PDF or TXT format</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="upload-form">
                <div className="form-group">
                    <label htmlFor="note-title">Note Title (Optional)</label>
                    <input
                        id="note-title"
                        type="text"
                        placeholder="e.g. Chapter 4: Neural Networks & Deep Learning"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div 
                    className={`dropzone ${isDragging ? 'dropzone-active' : ''} ${file ? 'dropzone-has-file' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf, .txt"
                        disabled={loading}
                        style={{ display: 'none' }}
                    />

                    {file ? (
                        <div className="dropzone-file-selected">
                            <div className="file-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </div>
                            <div className="file-info">
                                <strong className="file-name">{file.name}</strong>
                                <span className="file-size">{formatFileSize(file.size)}</span>
                            </div>
                            <button 
                                type="button" 
                                className="btn-icon-subtle"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div className="dropzone-prompt">
                            <div className="dropzone-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                    <path d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9"></path>
                                    <polyline points="16 16 12 12 8 16"></polyline>
                                    <line x1="12" y1="12" x2="12" y2="21"></line>
                                </svg>
                            </div>
                            <p className="dropzone-main-text">
                                <strong>Click to browse</strong> or drag & drop files here
                            </p>
                            <p className="dropzone-sub-text">Supported formats: PDF, TXT (up to 5 MB)</p>
                        </div>
                    )}
                </div>

                <div className="upload-actions">
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={loading || !file}
                    >
                        {loading ? (
                            <span className="btn-spinner-content">
                                <span className="spinner-sm"></span>
                                Uploading Note...
                            </span>
                        ) : (
                            <span>Upload Note</span>
                        )}
                    </button>
                </div>
            </form>

            {message && (
                <div className={`alert-banner ${isSuccess ? 'alert-success' : 'alert-error'}`} role="alert">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {isSuccess ? (
                            <polyline points="20 6 9 17 4 12"></polyline>
                        ) : (
                            <>
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </>
                        )}
                    </svg>
                    <span>{message}</span>
                </div>
            )}
        </div>
    );
};

export default NoteUpload;