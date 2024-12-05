"use client";

import React from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import * as yup from "yup";
import { FormProvider, useForm, useFormState } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { usePostQuizQuestionPostService } from "@/services/api/services/quiz-question";
import { t } from "i18next";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import OptionsFieldArray from "@/components/multiple-choice-question/option-field-array";
import { RoleEnum } from "@/services/api/types/role";

type CreateQuizQuestionFormData = {
  questionText: string;
  options: { value: string }[];
  answer: string;
  quizId: string;
};

const useValidationSchema = () => {
  return yup.object().shape({
    questionText: yup.string().required("Question text is required"),
    options: yup
      .array()
      .of(
        yup.object({ value: yup.string().required("Options text is required") })
      )
      .required("Options are required")
      .min(1, "At least one option is required"),
    answer: yup.string().required("Answer is required"),
    quizId: yup.string().required("Quiz id is required"),
  });
};

function CreateQuizQuestionFormActions() {
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      Submit
    </Button>
  );
}

function FormCreateQuizQuestion() {
  const router = useRouter();
  const params = useParams();
  const fetchPostQuizQuestion = usePostQuizQuestionPostService();
  const validationSchema = useValidationSchema();

  const quizId = Array.isArray(params.quiz_id)
    ? params.quiz_id[0]
    : params.quiz_id;
  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateQuizQuestionFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      questionText: "",
      options: [{ value: "" }],
      answer: "",
      quizId: quizId,
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchPostQuizQuestion({
      ...formData,
      options: formData.options.map((option) => option.value),
    });

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      Object.keys(data.errors).forEach((key) => {
        setError(key as keyof CreateQuizQuestionFormData, {
          type: "manual",
          message: t(`External server error ${key}: ${data.errors[key]}`),
        });
      });
      return;
    }

    if (status === HTTP_CODES_ENUM.CREATED) {
      enqueueSnackbar("Quiz question created successfully", {
        variant: "success",
      });
      router.push(`/courses/${courseId}/quizzes/${quizId}`);
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="lg">
        <form onSubmit={onSubmit} autoComplete="create-new-quiz-question">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Create Quiz Question</Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Question Text"
                variant="outlined"
                margin="normal"
                {...methods.register("questionText")}
                error={!!methods.formState.errors.questionText}
                helperText={methods.formState.errors.questionText?.message}
              />
            </Grid>

            {/*<Grid item xs={12}>*/}
            {/*  <TextField*/}
            {/*    fullWidth*/}
            {/*    label="Quiz ID"*/}
            {/*    variant="outlined"*/}
            {/*    margin="normal"*/}
            {/*    {...methods.register("quizId")}*/}
            {/*    error={!!methods.formState.errors.quizId}*/}
            {/*    helperText={methods.formState.errors.quizId?.message}*/}
            {/*    disabled*/}
            {/*  />*/}
            {/*</Grid>*/}

            <Grid item xs={12}>
              <OptionsFieldArray />
            </Grid>

            <Grid item xs={12} mt={3}>
              <CreateQuizQuestionFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={() => router.back()} // cancel button navigates back
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateQuizQuestion() {
  return <FormCreateQuizQuestion />;
}

export default withPageRequiredAuth(CreateQuizQuestion, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER],
});
