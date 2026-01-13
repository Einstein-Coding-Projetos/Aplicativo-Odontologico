// 1. Import: sempre vem no topo do arquivo
import { useState } from "react";

// 2. Perguntas em array
// question = pergunta
// options = alternativas (text = o que aparece, value = pontuação do dentinho)
const questions = [
  {
    question: "E aí, quantas vezes você escova os dentes por dia?",
    options: [
      { text: "Nenhuma...", value: 0 },
      { text: "1 - 2 vezes", value: 0 },
      { text: "3 - 4 vezes", value: 1 },
    ],
  },
  {
    question: "Você já viu alguma manchinha escura ou ponto preto nos seus dentes?",
    options: [
      { text: "SIM", value: 0 },
      { text: "NÃO", value: 1 },
    ],
  },
  {
    question: "Você visitou um dentista no último ano?",
    options: [
      { text: "SIM", value: 1 },
      { text: "NÃO", value: 0 },
    ],
  },
  {
    question: "Você passa o fio dental (aquele fiozinho entre os dentes)?",
    options: [
      { text: "SIM", value: 1 },
      { text: "NÃO", value: 0 },
    ],
  },
  {
    question:
      "Já sentiu seus dentes doendo quando come algo gelado, quente ou doce?",
    options: [
      { text: "SIM", value: 0 },
      { text: "NÃO", value: 1 },
    ],
  },
];

// 3. Componente da página do quiz
export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [careScore, setCareScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = questions[currentQuestion];

  function handleOptionClick(index) {
    setSelectedOption(index);
  }

  function handleNextQuestion() {
    if (selectedOption === null) return;

    const selectedValue = question.options[selectedOption].value;
    setCareScore((prev) => prev + selectedValue);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  }

  function handleRestart() {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setCareScore(0);
    setIsFinished(false);
  }

  function getResultMessage() {
    const maxScore = questions.length;

    if (careScore === maxScore) {
      return {
        emoji: "😁",
        text: "UAU, seu dentinho está SUPER feliz!\nContinue cuidando assim!",
      };
    } else if (careScore >= Math.ceil(maxScore / 2)) {
      return {
        emoji: "😄",
        text: "Falta pouco para seus dentes estarem completamente limpinhos!\nCuide um pouquinho mais",
      };
    } else {
      return {
        emoji: "😟",
        text: "CUIDADO!\nParece que seus dentinhos estão meio tristes. Que tal visitar um dentista para te ajudar a cuidar deles?",
      };
    }
  }

  if (isFinished) {
    const result = getResultMessage();

    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Como está o seu dentinho?</h1>
        <div style={styles.emoji}>{result.emoji}</div>
        <p style={styles.text}>{result.text}</p>
        <p style={styles.textSmall}>
          Pontos de cuidado: {careScore} de {questions.length}
        </p>
        <button style={styles.button} onClick={handleRestart}>
          Jogar de novo
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Quiz de Saúde Bucal 🦷</h1>

      <p style={styles.progress}>
        Pergunta {currentQuestion + 1} de {questions.length}
      </p>

      <h2 style={styles.question}>{question.question}</h2>

      <div style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            style={{
              ...styles.optionButton,
              ...(selectedOption === index ? styles.optionButtonSelected : {}),
            }}
          >
            {option.text}
          </button>
        ))}
      </div>

      <button style={styles.button} onClick={handleNextQuestion}>
        {currentQuestion + 1 === questions.length ? "Ver resultado" : "Próxima"}
      </button>
    </div>
  );
}

// 4. Estilinho básico
const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px",
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: "26px",
    marginBottom: "8px",
  },
  progress: {
    fontSize: "14px",
    marginBottom: "16px",
    opacity: 0.7,
  },
  question: {
    fontSize: "20px",
    marginBottom: "16px",
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
  },
  optionButton: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #0065a0ff", //borda das opções
    cursor: "pointer",
    backgroundColor: "#9ddefbff", //fundo das opções
    color: "#121752ff",           // ← COR DA FONTE
    fontSize: "16px",
    textAlign: "center",
  },
  optionButtonSelected: {
    borderColor: "#167ee6ff",
    backgroundColor: "#b21818ff",
  },
  button: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#f97316",
    color: "#fff", //cor do botão próximo
    fontWeight: "bold",
    marginTop: "8px",
  },
  emoji: {
    fontSize: "64px",
    marginBottom: "12px",
  },
  text: {
    fontSize: "18px",
    marginBottom: "8px",
  },
  textSmall: {
    fontSize: "14px",
    opacity: 0.8,
    marginBottom: "16px",
  },
};
