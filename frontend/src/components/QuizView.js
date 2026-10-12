import React, { useState, useEffect } from 'react';

const QuizView = ({ quizData, onClearQuiz }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset quiz state whenever new quiz data is received
  useEffect(() => {
    setUserAnswers({});
    setScore(null);
    setSubmitted(false);
  }, [quizData]);

  if (!quizData || !quizData.questions) {
    return null;
  }

  const handleAnswerSelect = (questionIndex, optionKey) => {
    if (submitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: optionKey,
    }));
  };

  const handleSubmitQuiz = () => {
    let correctAnswers = 0;
    quizData.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setSubmitted(true);
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setScore(null);
    setSubmitted(false);
  };

  const totalQuestions = quizData.questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const percentage = score !== null ? Math.round((score / totalQuestions) * 100) : 0;

  const getOptionCardClass = (questionIndex, optionKey) => {
    const isSelected = userAnswers[questionIndex] === optionKey;
    if (!submitted) {
      return isSelected ? 'quiz-option-card selected' : 'quiz-option-card';
    }

    const isCorrect = optionKey === quizData.questions[questionIndex].correct_answer;
    if (isCorrect) {
      return 'quiz-option-card correct';
    }
    if (isSelected && !isCorrect) {
      return 'quiz-option-card incorrect';
    }
    return 'quiz-option-card muted';
  };

  return (
    <div className="card quiz-section-card" id="quiz-view-section">
      <div className="card-header quiz-header">
        <div className="card-title-group">
          <div className="icon-badge icon-badge-neutral">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div>
            <h3>{quizData.quiz_title || 'AI Practice Quiz'}</h3>
            <p className="card-subtitle">Test your retention and understanding of the key concepts</p>
          </div>
        </div>

        <button 
          type="button"
          onClick={onClearQuiz} 
          className="btn btn-ghost btn-sm"
          title="Close Quiz"
        >
          ✕ Close
        </button>
      </div>

      {submitted && (
        <div className={`quiz-score-banner ${percentage >= 80 ? 'score-high' : percentage >= 50 ? 'score-mid' : 'score-low'}`}>
          <div className="score-badge-circle">
            <span className="score-percent">{percentage}%</span>
          </div>
          <div className="score-details">
            <h4>
              {percentage >= 80 ? '🎉 Excellent Job!' : percentage >= 50 ? '👍 Good Effort!' : '📚 Keep Reviewing!'}
            </h4>
            <p>You scored <strong>{score}</strong> out of <strong>{totalQuestions}</strong> questions correctly.</p>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={handleRetakeQuiz}
          >
            🔄 Retake Quiz
          </button>
        </div>
      )}

      <div className="quiz-questions-list">
        {quizData.questions.map((q, qIndex) => {
          return (
            <div key={qIndex} className="quiz-question-card">
              <div className="question-header">
                <span className="question-number-pill">Question {qIndex + 1} of {totalQuestions}</span>
                {submitted && (
                  <span className={`answer-status-pill ${userAnswers[qIndex] === q.correct_answer ? 'pill-correct' : 'pill-incorrect'}`}>
                    {userAnswers[qIndex] === q.correct_answer ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                )}
              </div>

              <h4 className="question-text">{q.question}</h4>

              <div className="quiz-options-grid">
                {Object.entries(q.options).map(([key, value]) => {
                  const isChecked = userAnswers[qIndex] === key;
                  const isCorrect = q.correct_answer === key;

                  return (
                    <div
                      key={key}
                      className={getOptionCardClass(qIndex, key)}
                      onClick={() => handleAnswerSelect(qIndex, key)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="option-indicator">
                        <span className="option-letter">{key}</span>
                      </div>
                      <div className="option-text">{value}</div>
                      {submitted && isCorrect && (
                        <span className="option-mark correct-mark">✓</span>
                      )}
                      {submitted && isChecked && !isCorrect && (
                        <span className="option-mark incorrect-mark">✕</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="quiz-footer-actions">
        {!submitted ? (
          <div className="submit-cluster">
            <span className="progress-hint">
              {answeredCount === totalQuestions ? 'All questions answered!' : `${answeredCount} of ${totalQuestions} answered`}
            </span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitQuiz}
              disabled={answeredCount !== totalQuestions}
            >
              Submit Quiz ({answeredCount}/{totalQuestions})
            </button>
          </div>
        ) : (
          <div className="submitted-cluster">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleRetakeQuiz}
            >
              🔄 Retake Quiz
            </button>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={onClearQuiz}
            >
              Done / Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;