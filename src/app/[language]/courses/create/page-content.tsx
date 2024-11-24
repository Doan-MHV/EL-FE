"use client";

import FormTextInput from "@/components/form/text-input/form-text-input";
import { usePostCourseService } from "@/services/api/services/course";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { User } from "@/services/api/types/user";
import useAuth from "@/services/auth/use-auth";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Container, Grid, Link, Typography } from "@mui/material";
import { t } from "i18next";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { FormProvider, useForm, useFormState } from "react-hook-form";
import * as yup from "yup";

type CreateCourseFormData = {
  courseName: string;
  categoryType: string;
  coursePrice: number;
  courseCreator?: User;
};

const useValidationSchema = () => {
  return yup.object().shape({
    courseName: yup.string().required("Course name is required"),
    categoryType: yup.string().required("Course category is required"),
    coursePrice: yup.number().required("Course price is required"),
  });
};

function CreateCourseFormActions() {
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

function FormCreateCourse() {
  const router = useRouter();
  const { user, isLoaded } = useAuth();
  const fetchPostCourse = usePostCourseService();
  const validationSchema = useValidationSchema();

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateCourseFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      courseName: "",
      categoryType: "",
      coursePrice: 0,
      courseCreator: {
        id: user?.id ?? "",
      },
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchPostCourse(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(data.errors) as Array<keyof CreateCourseFormData>).forEach(
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
      enqueueSnackbar("Create course successfully", {
        variant: "success",
      });
      router.push("/courses");
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit} autoComplete="create-new-course">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Create course</Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateCourseFormData>
                name="courseName"
                testId="new-course-name"
                autoComplete="new-course-name"
                label="Course name"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateCourseFormData>
                name="categoryType"
                testId="new-course-category"
                autoComplete="new-course-category"
                label="Course category"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateCourseFormData>
                name="coursePrice"
                testId="new-course-price"
                autoComplete="new-course-price"
                label="Course price"
              />
            </Grid>

            <Grid item xs={12}>
              <CreateCourseFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/courses"
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

function CreateCourse() {
  return <FormCreateCourse />;
}

export default withPageRequiredAuth(CreateCourse);
