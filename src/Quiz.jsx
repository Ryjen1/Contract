import { useState } from "react";

function Quiz() {
  const questions = [
    {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Rome"],
      answer: "Paris",
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      answer: "Mars",
    },
    {
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic", "Indian", "Arctic", "Pacific"],
      answer: "Pacific",
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleOptionClick = (selectedOption) => {
    const isCorrect = selectedOption === questions[currentQuestion].answer;

    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;

    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div>
        <h2>Quiz Completed!</h2>
        <p>
          Your score: {score} / {questions.length}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2>{questions[currentQuestion].question}</h2>
      <div>
        {questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            style={{ display: "block", margin: "10px" }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Quiz;
