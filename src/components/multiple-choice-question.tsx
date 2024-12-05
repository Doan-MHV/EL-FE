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
import { User } from "@/services/api/types/user";
import { RoleEnum } from "@/services/api/types/role";

type MultipleChoiceQuestionProps = {
  questions: QuizQuestion[];
  user: User | null;
  onSubmit: (correctAnswers: number, totalQuestions: number) => void;
  onTestSubmit: (correctAnswers: number) => void;
};

const shuffleArray = (array: string[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const MultipleChoiceQuestion = ({
  questions,
  user,
  onSubmit,
  onTestSubmit,
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
    onSubmit(correctAnswers, questions.length);
  };

  const handleTestSubmit = () => {
    const correctAnswers = questions.reduce((score, question, index) => {
      if (question.answer !== undefined && question.answer === answers[index]) {
        return score + 1;
      }
      return score;
    }, 0);
    onTestSubmit(correctAnswers);
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
      {!!user?.role && [RoleEnum.USER].includes(Number(user?.role?.id)) && (
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      )}
      {!!user?.role &&
        [RoleEnum.TEACHER, RoleEnum.ADMIN].includes(Number(user?.role?.id)) && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleTestSubmit}
          >
            Test Submit
          </Button>
        )}
    </Container>
  );
};

export default MultipleChoiceQuestion;
