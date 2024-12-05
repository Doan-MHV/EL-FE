"use client";

import { QuizQuestion } from "@/services/api/types/quiz-question";
import { Button, Container, Grid, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SortEnum } from "@/services/api/types/sort-type";
import useAuth from "@/services/auth/use-auth";
import { Quiz } from "@/services/api/types/quiz";
import { useQuizQuestionListQuery } from "@/app/[language]/courses/[course_id]/quizzes/[quiz_id]/queries/quiz-queston-queries";
import Link from "@/components/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetQuizService } from "@/services/api/services/quiz";
import { useSnackbar } from "notistack";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import MultipleChoiceQuestion from "@/components/multiple-choice-question";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { RoleEnum } from "@/services/api/types/role";
import { usePostGradeService } from "@/services/api/services/grade";

type QuizQuestionsKeys = keyof QuizQuestion;

function QuizDetails() {
  const params = useParams();
  const quizId = Array.isArray(params.quiz_id)
    ? params.quiz_id[0]
    : params.quiz_id;
  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;
  const theme = useTheme();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const fetchQuiz = useGetQuizService();
  const fetchPostGrade = usePostGradeService();
  const { enqueueSnackbar } = useSnackbar();
  const [quiz, setQuiz] = useState<Quiz>();
  const [correctAnswers, setCorrectAnswers] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [status, setStatus] = useState(HTTP_CODES_ENUM.NOT_FOUND);
  const [{ order, orderBy }, setSort] = useState<{
    order: SortEnum;
    orderBy: QuizQuestionsKeys;
  }>(() => {
    const searchParamsSort = searchParams.get("sort");
    if (searchParamsSort) {
      return JSON.parse(searchParamsSort);
    }
    return { order: SortEnum.DESC, orderBy: "id" };
  });

  const { data } = useQuizQuestionListQuery({
    filter: {
      quizzes: [quizId],
    },
    sort: { order, orderBy },
  });

  // const handleScroll = useCallback(() => {
  //   if (!hasNextPage || isFetchingNextPage) return;
  //   fetchNextPage();
  // }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data) as QuizQuestion[]) ??
      ([] as QuizQuestion[]);

    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  const getQuizData = useCallback(async () => {
    try {
      const response = await fetchQuiz({ id: quizId });
      if (response.status === HTTP_CODES_ENUM.OK) {
        setQuiz(response.data);
        setStatus(response.status);
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch assignment details", {
        variant: "error",
      });
      setStatus(HTTP_CODES_ENUM.SERVICE_UNAVAILABLE);
    }
  }, [quizId, fetchQuiz, enqueueSnackbar]);

  useEffect(() => {
    getQuizData().then();
  }, [getQuizData]);

  const getFeedbackMessage = (
    correctAnswers: number | null,
    totalQuestions: number
  ): string => {
    if (correctAnswers === null) return "";

    const score = correctAnswers / totalQuestions;

    if (score >= 0.7) return "Excellent!";
    if (score >= 0.5) return "Good job!";
    if (score >= 0.3) return "Needs Improvement.";

    return "Poor performance";
  };

  const handleQuizSubmit = async (
    correctAnswersCount: number,
    totalQuestions: number
  ) => {
    setCorrectAnswers(correctAnswersCount);
    setOpenDialog(true);

    const payloadData = {
      name: quiz?.title,
      feedback: getFeedbackMessage(correctAnswersCount, totalQuestions),
      grade: correctAnswersCount,
      maxGrade: totalQuestions,
      student: {
        id: authUser?.id ?? "",
      },
      course: {
        id: courseId,
      },
      quiz: {
        id: quizId,
      },
    };

    const { status } = await fetchPostGrade(payloadData);

    if (status === HTTP_CODES_ENUM.CREATED) {
      enqueueSnackbar("Quiz submitted successfully", {
        variant: "success",
      });
    } else {
      enqueueSnackbar("Failed to submit quiz", {
        variant: "error",
      });
    }
  };

  const handleQuizTest = (correctAnswersCount: number) => {
    setCorrectAnswers(correctAnswersCount);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" spacing={3} mt={2} mb={2}>
        <Grid item xs={12}>
          <Typography variant="h3">Quiz Details</Typography>
          <Typography variant="h3">{quiz?.title}</Typography>
        </Grid>
        {/*<Grid item xs={12} mb={5}>*/}
        {/*  <div data-color-mode="light">*/}
        {/*    <MarkdownPreview source={assignment?.description} />*/}
        {/*  </div>*/}
        {/*</Grid>*/}
        <Grid container item spacing={3} xs={12}>
          <Grid item xs>
            <Typography variant="h5">Quiz Questions</Typography>
          </Grid>

          {!!authUser?.role &&
            [RoleEnum.TEACHER, RoleEnum.ADMIN].includes(
              Number(authUser?.role?.id)
            ) && (
              <Grid container item xs="auto" wrap="nowrap" spacing={2}>
                <Grid item xs="auto">
                  <Button
                    variant="contained"
                    LinkComponent={Link}
                    href={`/courses/${courseId}/quizzes/${quizId}/create-quiz-question`}
                    color="success"
                  >
                    CREATE QUIZ QUESTION
                  </Button>
                </Grid>
              </Grid>
            )}
        </Grid>

        <Grid item xs>
          <MultipleChoiceQuestion
            questions={result}
            user={authUser}
            onSubmit={handleQuizSubmit}
            onTestSubmit={handleQuizTest}
          />
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "#fff",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Quiz Result
        </DialogTitle>
        <DialogContent
          sx={{
            bgcolor:
              correctAnswers !== null
                ? correctAnswers / result.length >= 0.7
                  ? "#d4edda" // Light green
                  : correctAnswers / result.length >= 0.5
                    ? "#fff3cd" // Light yellow
                    : correctAnswers / result.length >= 0.3
                      ? "#ffeeba" // Peach
                      : "#f8d7da" // Light red
                : "#fff", // Default white if no score
            textAlign: "center",
            padding: 3, // Consistent padding
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {correctAnswers !== null
              ? `Correct answers: ${correctAnswers} out of ${result.length}`
              : "No quiz result available"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            {getFeedbackMessage(correctAnswers, result.length)}
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            pb: 2,
          }}
        >
          <Button
            onClick={handleDialogClose}
            href={`/courses/${courseId}/quizzes`}
            sx={{
              bgcolor: "primary.main",
              color: "#fff",
              "&:hover": { bgcolor: "primary.dark" },
            }}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default withPageRequiredAuth(QuizDetails);
