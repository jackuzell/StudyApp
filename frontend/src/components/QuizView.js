import REACT from 'react';

const QuizView = ({quizData, onClearQuiz}) => {
    if(!quizData){
        return null; // if there is no quiz to display
    }

    return(
        <div className="quiz-view-section">
            <h3>{quizData.quiz_title}</h3>
         <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>Attempt the quiz below based on your notes!</p>
      
      {quizData.questions.map((q, index) => (
        // Apply the 'quiz-question' class
        <div key={index} className="quiz-question">
          <h4>{index + 1}. {q.question}</h4>
          <ul>
            {Object.entries(q.options).map(([key, value]) => (
              <li key={key}>
                <input type="radio" name={`question-${index}`} id={`q${index}-${key}`} disabled />
                <label htmlFor={`q${index}-${key}`}>
                    <strong>{key}:</strong> {value}
                </label>
              </li>
            ))}
          </ul>
          {/* DEBUG LINE */}
          <p style={{ color: 'green', fontWeight: 'bold', marginTop: '10px' }}>
            [DEBUG] Correct Answer: {q.correct_answer}
          </p> 
        </div>
      ))}
      <div style={{ overflow: 'auto' }}>
        <button 
          onClick={onClearQuiz}
          className="quiz-clear-btn" // Apply the 'quiz-clear-btn' class
        >
          Close Quiz View
        </button>
      </div>
    </div>
  );
};

export default QuizView;
        
    