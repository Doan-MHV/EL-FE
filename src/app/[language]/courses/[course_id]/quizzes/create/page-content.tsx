"use client";

import { Course } from "@/services/api/types/course";
import * as yup from "yup";
import { FormProvider, useForm, useFormState } from "react-hook-form";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { Box, Button, Container, Grid, Link, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import { yupResolver } from "@hookform/resolvers/yup";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { t } from "i18next";
import { usePostQuizService } from "@/services/api/services/quiz";
import FormTextInput from "@/components/form/text-input/form-text-input";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

type CreateQuizFormData = {
  title: string;
  course?: Course;
};

const useValidationSchema = () => {
  return yup.object().shape({
    title: yup.string().required("Title is required"),
  });
};

function CreateQuizFormActions() {
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

function FormCreateQuiz() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoaded } = useAuth();
  const fetchPostQuiz = usePostQuizService();
  const validationSchema = useValidationSchema();

  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateQuizFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: "",
      course: {
        id: courseId,
      },
    },
  });

  const { handleSubmit, control, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchPostQuiz(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(data.errors) as Array<keyof CreateQuizFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(`External server error ${key}: ${data.errors[key]}`),
          });
        }
      );
      return;
    }

    if (status === HTTP_CODES_ENUM.CREATED) {
      enqueueSnackbar("Create quiz successfully", {
        variant: "success",
      });
      router.push(`/courses/${courseId}/quizzes`);
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="lg">
        <form onSubmit={onSubmit} autoComplete="create-new-quiz">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Create Quiz</Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateQuizFormData>
                name="title"
                testId="new-quiz-title"
                autoComplete="new-quiz-title"
                label="Quiz title"
              />
            </Grid>

            <Grid item xs={12}>
              <CreateQuizFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href={`/courses/${courseId}/quizzes`}
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

function CreateQuiz() {
  return <FormCreateQuiz />;
}

export default withPageRequiredAuth(CreateQuiz, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER],
});
