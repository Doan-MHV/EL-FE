import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { QuizQuestion } from "@/services/api/types/quiz-question";

type MultipleChoiceQuestionProps = {
  questions: QuizQuestion[];
  onSubmit: (correctAnswers: number) => void;
};

const shuffleArray = (array: any[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const MultipleChoiceQuestion = ({
  questions,
  onSubmit,
}: MultipleChoiceQuestionProps) => {
  // Initializing answers state as empty strings to keep RadioGroup controlled
  const [answers, setAnswers] = useState(() => questions.map(() => ""));
  const [shuffledOptions, setShuffledOptions] = useState<string[][]>([]);

  useEffect(() => {
    const shuffled = questions.map((question) =>
      shuffleArray(question.options || [])
    );
    setShuffledOptions(shuffled);
  }, [questions]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const correctAnswers = questions.reduce((score, question, index) => {
      if (question.answer !== undefined && question.answer === answers[index]) {
        return score + 1;
      }
      return score;
    }, 0);
    onSubmit(correctAnswers);
  };

  return (
    <Container maxWidth="md">
      {questions.map((question, questionIndex) => (
        <Box key={question.id} mb={4}>
          <Typography variant="h6" gutterBottom>
            {question.questionText}
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              name={`question-${question.id}`}
              value={answers[questionIndex] ?? ""}
              onChange={(e) =>
                handleAnswerChange(questionIndex, e.target.value)
              }
            >
              {shuffledOptions[questionIndex]?.map((option, optionIndex) => (
                <FormControlLabel
                  key={optionIndex}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      ))}
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Container>
  );
};

export default MultipleChoiceQuestion;
