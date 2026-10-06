import React, { useState } from 'react';

const downloadSummary = (title, summary) => {
    const textContent = `${title}\n\nKey Notes:\n\n${summary}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const SummaryView = ({ summaryData, onClearSummary }) => {
    const [copied, setCopied] = useState(false);

    if (!summaryData) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${summaryData.title}\n\n${summaryData.summary}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error('Failed to copy summary:', err);
        }
    };

    // Format lines: render bullets or bold text nicely
    const renderSummaryLines = (text) => {
        if (!text) return null;
        const lines = text.split('\n');

        return lines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) {
                return <div key={idx} className="summary-spacer" />;
            }

            const isBullet = trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.startsWith('•');
            const cleanText = isBullet ? trimmed.replace(/^[*•-]\s*/, '') : trimmed;

            if (isBullet) {
                return (
                    <li key={idx} className="summary-bullet-item">
                        <span className="bullet-dot">•</span>
                        <span className="bullet-text">{cleanText}</span>
                    </li>
                );
            }

            if (trimmed.startsWith('#') || trimmed.endsWith(':')) {
                return (
                    <h5 key={idx} className="summary-heading">
                        {trimmed.replace(/^#+\s*/, '')}
                    </h5>
                );
            }

            return (
                <p key={idx} className="summary-paragraph">
                    {trimmed}
                </p>
            );
        });
    };

    return (
        <div className="card summary-section-card" id="summary-view-section">
            <div className="card-header summary-header">
                <div className="card-title-group">
                    <div className="icon-badge icon-badge-emerald">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h3>{summaryData.title}</h3>
                        <p className="card-subtitle">AI-distilled essential points & concepts</p>
                    </div>
                </div>

                <div className="summary-top-actions">
                    <button 
                        type="button" 
                        onClick={handleCopy} 
                        className="btn btn-outline btn-sm"
                        title="Copy to clipboard"
                    >
                        {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                    <button 
                        type="button"
                        onClick={() => downloadSummary(summaryData.title, summaryData.summary)}
                        className="btn btn-primary btn-sm"
                        title="Download summary text file"
                    >
                        ⬇ Download .txt
                    </button>
                    <button 
                        type="button"
                        onClick={onClearSummary} 
                        className="btn btn-ghost btn-sm"
                        title="Close Summary"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="summary-body-box">
                <ul className="summary-list">
                    {renderSummaryLines(summaryData.summary)}
                </ul>
            </div>

            <div className="summary-footer">
                <button 
                    type="button"
                    onClick={onClearSummary} 
                    className="btn btn-outline btn-sm"
                >
                    Close Summary View
                </button>
            </div>
        </div>
    );
};

export default SummaryView;