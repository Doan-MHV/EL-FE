"use client";

import { Assignment } from "@/services/api/types/assignment";
import { FileEntity } from "@/services/api/types/file-entity";
import { User } from "@/services/api/types/user";
import { FormProvider, useForm, useFormState } from "react-hook-form";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { Box, Button, Container, Grid, Link, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { usePostAssignmentSubmissionService } from "@/services/api/services/assignment-submission";
import useAuth from "@/services/auth/use-auth";
import { useSnackbar } from "notistack";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { t } from "i18next";
import FormTextInput from "@/components/form/text-input/form-text-input";
import FormFileInput from "@/components/form/file_input/form-file-input";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";

type CreateAssignmentSubmissionFormData = {
  status: string;
  student: User | null;
  assignment?: Assignment;
  file?: FileEntity;
};

// const useValidationSchema = () => {
//   return yup.object().shape({
//     status: yup.string().required(),
//   });
// };

function CreateAssignmentSubmissionFormActions() {
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

function FormCreateAssignmentSubmission() {
  const router = useRouter();
  const params = useParams();
  const { user: authUser } = useAuth();
  const fetchPostAssignmentSubmission = usePostAssignmentSubmissionService();

  const assignmentId = Array.isArray(params.assignment_id)
    ? params.assignment_id[0]
    : params.assignment_id;

  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateAssignmentSubmissionFormData>({
    // resolver: yupResolver(validationSchema),
    defaultValues: {
      status: "Not Graded",
      student: authUser ?? null,
      file: undefined,
      assignment: {
        id: assignmentId,
      },
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchPostAssignmentSubmission(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (
        Object.keys(data.errors) as Array<
          keyof CreateAssignmentSubmissionFormData
        >
      ).forEach((key) => {
        setError(key, {
          type: "manual",
          message: t(`External server error ${key}: ${data.errors[key]}`),
        });
      });
      return;
    }

    if (status === HTTP_CODES_ENUM.CREATED) {
      enqueueSnackbar("Create assignment material successfully", {
        variant: "success",
      });
      router.push(`/courses/${assignmentId}/assignments/${assignmentId}`);
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="lg">
        <form
          onSubmit={onSubmit}
          autoComplete="create-new-assignment-submission"
        >
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Create Assignment Submission</Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateAssignmentSubmissionFormData>
                name="status"
                testId="new-assignment-submission-status"
                autoComplete="new-assignment-submission-status"
                label="Status"
              />
            </Grid>
            <Grid item xs={12}>
              <FormFileInput<CreateAssignmentSubmissionFormData>
                name="file"
                testId="file"
              />
            </Grid>

            <Grid item xs={12}>
              <CreateAssignmentSubmissionFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href={`/courses/${courseId}/assignments/${assignmentId}`}
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

export function CreateAssignmentSubmission() {
  return <FormCreateAssignmentSubmission />;
}

export default withPageRequiredAuth(CreateAssignmentSubmission);
