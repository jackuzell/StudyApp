import React, { useState } from 'react';

const QuizView = ({ quizData, onClearQuiz }) => {
  if (!quizData) {
    return null;
  }

  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null); // State to store the final score
  const [submitted, setSubmitted] = useState(false); // State to track submission

  const handleAnswerSelect = (questionIndex, optionKey) => {
    // Prevent changing answers after submission
    if (submitted) return;
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: optionKey,
    });
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

  const getOptionClass = (questionIndex, optionKey) => {
    if (!submitted) return '';
    const isCorrect = optionKey === quizData.questions[questionIndex].correct_answer;
    const isSelected = userAnswers[questionIndex] === optionKey;

    if (isCorrect && isSelected) return 'correct-answer';
    if (isCorrect && !isSelected) return 'correct-answer'; // Highlight correct answer if it was not selected
    if (!isCorrect && isSelected) return 'incorrect-answer';
    return '';
  };

  return (
    <div className="quiz-view-section">
      <h3>{quizData.quiz_title}</h3>
      <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>Attempt the quiz below based on your notes!</p>
      
      {submitted && (
        <h4 style={{ color: 'green', textAlign: 'center' }}>
          Your Score: {score} out of {quizData.questions.length}
        </h4>
      )}

      {quizData.questions.map((q, index) => (
        <div key={index} className="quiz-question">
          <h4>{index + 1}. {q.question}</h4>
          <ul>
            {Object.entries(q.options).map(([key, value]) => (
              <li key={key} className={getOptionClass(index, key)}>
                <input
                  type="radio"
                  name={`question-${index}`}
                  id={`q${index}-${key}`}
                  checked={userAnswers[index] === key}
                  onChange={() => handleAnswerSelect(index, key)}
                  disabled={submitted}
                />
                <label htmlFor={`q${index}-${key}`}>
                  <strong>{key}:</strong> {value}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div style={{ overflow: 'auto' }}>
        {!submitted && (
          <button onClick={handleSubmitQuiz} disabled={Object.keys(userAnswers).length !== quizData.questions.length}>
            Submit Quiz
          </button>
        )}
        <button onClick={onClearQuiz} className="quiz-clear-btn" style={{ float: 'right' }}>
          Close Quiz View
        </button>
      </div>
    </div>
  );
};

export default QuizView;