"use client";

import FormDatePickerInput from "@/components/form/date-pickers/date-picker";
import FormTextInput from "@/components/form/text-input/form-text-input";
import { usePostLectureService } from "@/services/api/services/lecture";
import { Course } from "@/services/api/types/course";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Container, Grid, Link, Typography } from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import { t } from "i18next";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import {
  Controller,
  FormProvider,
  useForm,
  useFormState,
} from "react-hook-form";
import * as yup from "yup";

type CreateLectureFormData = {
  lectureName: string;
  lectureTime: string;
  lectureDate: Date;
  markdownContent: string;
  course?: Course;
};

const useValidationSchema = () => {
  return yup.object().shape({
    lectureName: yup.string().required("Lecture name is required"),
    lectureTime: yup.string().required("Lecture time is required"),
    lectureDate: yup.date().required("Lecture date is required"),
    markdownContent: yup.string().required("Lecture content is required"),
  });
};

function CreateLectureFormActions() {
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

function FormCreateLecture() {
  const router = useRouter();
  const params = useParams();
  // const { user, isLoaded } = useAuth();
  const fetchPostLecture = usePostLectureService();
  const validationSchema = useValidationSchema();

  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateLectureFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      lectureName: "",
      lectureTime: "",
      lectureDate: new Date(),
      markdownContent: "",
      course: {
        id: courseId,
      },
    },
  });

  const { handleSubmit, control, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchPostLecture(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(data.errors) as Array<keyof CreateLectureFormData>).forEach(
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
      enqueueSnackbar("Create lecture successfully", {
        variant: "success",
      });
      router.push(`/courses/${courseId}/lectures`);
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="lg">
        <form onSubmit={onSubmit} autoComplete="create-new-lecture">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Create Lecture</Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateLectureFormData>
                name="lectureName"
                testId="new-lecture-name"
                autoComplete="new-lecture-name"
                label="Lecture name"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateLectureFormData>
                name="lectureTime"
                testId="new-lecture-time"
                autoComplete="new-lecture-time"
                label="Lecture time"
              />
            </Grid>

            <Grid item xs={12}>
              <FormDatePickerInput<CreateLectureFormData>
                name="lectureDate"
                testId="new-lecture-date"
                label="Lecture date"
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="markdownContent"
                control={control}
                render={({ field }) => (
                  <div data-color-mode="light">
                    <MDEditor {...field} height={400} />
                  </div>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <CreateLectureFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href={`/courses/${courseId}/lectures`}
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

function CreateLecture() {
  return <FormCreateLecture />;
}

export default withPageRequiredAuth(CreateLecture);
