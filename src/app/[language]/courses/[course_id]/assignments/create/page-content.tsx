"use client";

import FormDatePickerInput from "@/components/form/date-pickers/date-picker";
import FormTextInput from "@/components/form/text-input/form-text-input";
import { usePostAssignmentService } from "@/services/api/services/assignment";
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

type CreateAssignmentFormData = {
  name: string;
  description?: string;
  deadline: Date;
  status?: string;
  course?: Course;
};

const useValidationSchema = () => {
  return yup.object().shape({
    name: yup.string().required("Assignment name is required"),
    deadline: yup.date().required("Assignment deadline is required"),
  });
};

function CreateAssignmentFormActions() {
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

function FormCreateAssignment() {
  const router = useRouter();
  const params = useParams();
  // const { user, isLoaded } = useAuth();
  const fetchPostAssignment = usePostAssignmentService();
  const validationSchema = useValidationSchema();

  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateAssignmentFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      description: "",
      deadline: new Date(),
      status: "",
      course: {
        id: courseId,
      },
    },
  });

  const { handleSubmit, control, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchPostAssignment(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (
        Object.keys(data.errors) as Array<keyof CreateAssignmentFormData>
      ).forEach((key) => {
        setError(key, {
          type: "manual",
          message: t(`External server error ${key}: ${data.errors[key]}`),
        });
      });
      return;
    }

    if (status === HTTP_CODES_ENUM.CREATED) {
      enqueueSnackbar("Create lecture successfully", {
        variant: "success",
      });
      router.push(`/courses/${courseId}/assignments`);
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="lg">
        <form onSubmit={onSubmit} autoComplete="create-new-lecture">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Create Assignment</Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateAssignmentFormData>
                name="name"
                testId="new-assignment-name"
                autoComplete="new-assignment-name"
                label="Assignment Name"
              />
            </Grid>

            <Grid item xs={12}>
              <FormDatePickerInput<CreateAssignmentFormData>
                name="deadline"
                testId="new-assignment-deadline"
                label="Assignment Deadline"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateAssignmentFormData>
                name="status"
                testId="new-assignment-status"
                autoComplete="new-assignment-status"
                label="Assignment Status"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1">Assignment Description</Typography>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div data-color-mode="light">
                    <MDEditor {...field} height={400} />
                  </div>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <CreateAssignmentFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href={`/courses/${courseId}/assignments`}
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

function CreateAssignment() {
  return <FormCreateAssignment />;
}

export default withPageRequiredAuth(CreateAssignment);
