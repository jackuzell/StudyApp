import React from 'react';
import axios from 'axios';

const downloadSummary = (title, summary) => {
    const textContent = `${title}\n\nKey Notes: \n\n${summary}`;
    const blob = new Blob([textContent], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_KeyNotes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

};

const SummaryView = ({ summaryData, onClearSummary}) => {
    if (!summaryData) return null;
    return (
        <div className="summary-view-section">
            <h3>{summaryData.title}</h3>
            <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>AI-Generated Summary: </p>
            
            <div className="summary-content">
                <pre>{summaryData.summary}</pre>
            </div>

            <div style={{ overflow: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                    onClick={() => downloadSummary(summaryData.title, summaryData.summary)}
                >
                    Download Summary (.txt)
                </button>
                <button onClick={onClearSummary} className="delete-btn">
                    Close Summary View
                </button>
            </div>
        </div>
    );
};

export default SummaryView;