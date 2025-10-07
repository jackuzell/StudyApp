import React, {useState} from 'react';
import axios from 'axios';

//base URL for backend API
const API_URL = 'http://localhost:5000/api/notes';

const NoteUpload = ({ onUploadSuccess}) => {
    const [file, setFile] = useState(null); // State to store the selected file
    const [title, setTitle] = useState('');// state for the note title
    const [loading, setLoading] = useState(false); // loading indicator 
    const [message, setMessage] = useState(''); // message to display success or error

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); //store file object from input
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value); //store title from input
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); //prevent default form submission behavior
        if(!file){
            setMessage('Please select a file you wish to upload');
            return;
        }

        setLoading(true);
        setMessage('Uploading your file...');

        const formData = new FormData();
        formData.append('noteFile', file); // must match name in backend
        formData.append('title', title||file.name); //send title

        try{
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage(`Success: ${response.data.message}`);
            setFile(null);
            setTitle('');
            onUploadSuccess();
        }catch(error){
            console.error('Upload error:', error.repsonse ? error.response.data : error.message);
            setMessage(`Uplaod failed: ${error.response?.data?.message||'Server error'}`);
        }finally{
            setLoading(false);
        }
    };

   const messageClass = message.includes('Success') ? 'message-success' : 'message-error';


    return(
        <div className="upload-section">
            <h2>Upload new notes</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text"
                    placeholder="Note title"
                    value={title}
                    onChange={handleTitleChange}
                    disabled={loading}
                />
                <input
                    type = "file"
                    onChange={handleFileChange}
                    accept='.pdf, .txt' // add in ppt later if wanted
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload Note'}
                </button>
            </form>
            {message && <p className={`message-box ${messageClass}`}>{message}</p>}
        </div>
    );

};

export default NoteUpload;
