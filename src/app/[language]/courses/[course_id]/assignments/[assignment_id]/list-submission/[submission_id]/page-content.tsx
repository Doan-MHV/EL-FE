"use client";

import { useGetAssignmentSubmissionService } from "@/services/api/services/assignment-submission";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { AssignmentSubmission } from "@/services/api/types/assignment-submission";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import * as yup from "yup";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import { useParams, useRouter } from "next/navigation";
import { EmbedPDF } from "@simplepdf/react-embed-pdf";
import { Troubleshoot } from "@mui/icons-material";
import { STORAGE_URL } from "@/services/api/config";
import { usePostAIService } from "@/services/api/services/ai";
import { Assignment } from "@/services/api/types/assignment";
import { Course } from "@/services/api/types/course";
import { User } from "@/services/api/types/user";
import { FormProvider, useForm, useFormState } from "react-hook-form";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { yupResolver } from "@hookform/resolvers/yup";
import useAuth from "@/services/auth/use-auth";
import { t } from "i18next";
import { usePostGradeService } from "@/services/api/services/grade";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import FormTextInput from "@/components/form/text-input/form-text-input";

type CreateGradeFormData = {
  name: string;
  feedback: string;
  grade: number;
  maxGrade: number;
  student?: User;
  course?: Course;
  assignment?: Assignment;
};

const useValidationScheme = () => {
  return yup.object().shape({
    name: yup.string().required("Name is required"),
    feedback: yup.string().required("Feedback is required"),
    grade: yup
      .number()
      .required("Grade is required")
      .positive("Grade must be greater than 0")
      .test(
        "is-not-greater-than-max",
        "Grade cannot be greater than max grade",
        function (value) {
          return value <= this.parent.maxGrade;
        }
      ),
    maxGrade: yup.number().required("Max grade is required"),
  });
};

function CreateGradeFormActions() {
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

function AssignmentSubmissionDetails() {
  const router = useRouter();
  const params = useParams();
  const assignmentSubmissionId = Array.isArray(params.submission_id)
    ? params.submission_id[0]
    : params.submission_id;
  const assignmentId = Array.isArray(params.assignment_id)
    ? params.assignment_id[0]
    : params.assignment_id;
  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;
  const fetchAssignmentSubmission = useGetAssignmentSubmissionService();
  const fetchPostGrade = usePostGradeService();
  const fetchPostAI = usePostAIService();
  const { enqueueSnackbar } = useSnackbar();

  const { user: authUser } = useAuth();
  const validationSchema = useValidationScheme();

  const theme = useTheme();

  const [assignmentSubmission, setAssignmentSubmission] =
    useState<AssignmentSubmission>();
  const [status, setStatus] = useState(HTTP_CODES_ENUM.NOT_FOUND);

  // State for controlling the Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [predictionScore, setPredictionScore] = useState<number | undefined>(
    undefined
  );

  const handleDialogClose = () => {
    setOpenDialog(false);
    setPredictionScore(undefined);
  };

  useEffect(() => {
    const getAssignmentSubmissionData = async () => {
      try {
        const response = await fetchAssignmentSubmission({
          id: assignmentSubmissionId,
        });
        if (response.status === HTTP_CODES_ENUM.OK) {
          setAssignmentSubmission(response.data);
          setStatus(response.status);
        }
      } catch (error) {
        enqueueSnackbar("Failed to fetch assignment submission details", {
          variant: "error",
        });
        setStatus(HTTP_CODES_ENUM.SERVICE_UNAVAILABLE);
      }
    };

    getAssignmentSubmissionData().then();
  }, [assignmentSubmissionId, fetchAssignmentSubmission, enqueueSnackbar]);

  const handleHighlightAndSend = async () => {
    try {
      // Read text from clipboard
      const copiedText = await navigator.clipboard.readText();

      if (!copiedText) {
        enqueueSnackbar("No text copied to clipboard!", { variant: "warning" });
        return;
      }

      const aiRequestPayload = { text: copiedText };

      // Directly use the extracted variable in the fetchPostAI call
      const { data, status } = await fetchPostAI(aiRequestPayload);

      if (status === HTTP_CODES_ENUM.OK) {
        setPredictionScore(data.prediction);
        setOpenDialog(true);
      }
    } catch (error) {
      enqueueSnackbar("Failed to read clipboard text", {
        variant: "error",
      });
      console.error("Error reading clipboard:", error);
    }
  };

  const methods = useForm<CreateGradeFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      feedback: "",
      grade: 0,
      maxGrade: 0,
      student: {
        id: "",
      },
      course: {
        id: "",
      },
      assignment: {
        id: "",
      },
    },
  });

  const { handleSubmit, setError, reset } = methods;

  useEffect(() => {
    if (assignmentSubmission) {
      reset({
        name: assignmentSubmission.assignment?.name ?? "",
        feedback: "",
        grade: 0,
        maxGrade: assignmentSubmission.assignment?.maxGrade ?? 40,
        student: {
          id: assignmentSubmission.student?.id ?? "",
        },
        course: {
          id: courseId,
        },
        assignment: {
          id: assignmentSubmission.assignment?.id ?? "",
        },
      });
    }
  }, [assignmentSubmission, authUser, courseId, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchPostGrade(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(data.errors) as Array<keyof CreateGradeFormData>).forEach(
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
      enqueueSnackbar("Graded assignment successfully", {
        variant: "success",
      });
      router.push(
        `/courses/${courseId}/assignments/${assignmentId}/list-submission`
      );
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="lg">
        <Grid container direction="column" spacing={2} mt={3}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{
                padding: 4,
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
                boxShadow: 2,
              }}
            >
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  alt={`${assignmentSubmission?.student?.firstName} ${assignmentSubmission?.student?.lastName}`}
                  src={`${STORAGE_URL}${assignmentSubmission?.student?.photo?.path}`}
                  sx={{
                    width: 64,
                    height: 64,
                    marginRight: 3,
                    bgcolor: "primary.main",
                  }}
                />
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  Assignment Submission
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {assignmentSubmission?.student && (
                <Box mb={2}>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    gutterBottom
                  >
                    Student Name:
                  </Typography>
                  <Typography variant="h6" sx={{ textTransform: "capitalize" }}>
                    {assignmentSubmission.student.firstName}{" "}
                    {assignmentSubmission.student.lastName}
                  </Typography>
                </Box>
              )}

              {!!authUser?.role &&
                [RoleEnum.ADMIN, RoleEnum.TEACHER].includes(
                  Number(authUser.role.id)
                ) && (
                  <Box mb={4}>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      gutterBottom
                    >
                      Maximum Grade For Assignment:
                    </Typography>
                    <Typography variant="h6">
                      {assignmentSubmission?.assignment?.maxGrade ?? "N/A"}
                    </Typography>
                  </Box>
                )}

              <form onSubmit={onSubmit} autoComplete="off">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormTextInput<CreateGradeFormData>
                      name="grade"
                      testId="new-grade-grade"
                      autoComplete="new-grade-grade"
                      label="Grade"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormTextInput<CreateGradeFormData>
                      name="feedback"
                      testId="new-grade-feedback"
                      autoComplete="new-grade-feedback"
                      label="Feedback"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CreateGradeFormActions />
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          <Grid
            item
            style={{
              position: "relative",
              height: "150vh",
              overflow: "hidden",
            }}
          >
            <EmbedPDF
              companyIdentifier="yourcompany"
              documentURL={`${STORAGE_URL}${assignmentSubmission?.file?.path}`}
              mode={"inline"}
              style={{
                width: "100%",
                height: "100%",
              }}
            ></EmbedPDF>
          </Grid>
          <Fab
            color="primary"
            aria-label="highlight-and-send"
            style={{
              position: "fixed",
              top: "50%",
              transform: "translateY(-50%)",
              right: 20,
              zIndex: 10,
            }}
            onClick={handleHighlightAndSend}
          >
            <Troubleshoot />
          </Fab>
          <Dialog open={openDialog} onClose={handleDialogClose}>
            <DialogTitle
              style={{
                backgroundColor: theme.palette.primary.main,
                color: "#ffffff",
                textAlign: "center",
              }}
            >
              Prediction Score
            </DialogTitle>
            <DialogContent
              style={{
                backgroundColor:
                  predictionScore !== undefined
                    ? predictionScore > 70
                      ? "#ffebee" // Light red for high scores
                      : predictionScore > 50
                        ? "#fff3e0" // Light orange for medium scores
                        : predictionScore > 30
                          ? "#e8f5e9" // Light green for low scores
                          : "#e3f2fd" // Light blue for authentic content
                    : "#ffffff", // Default white if no score
                textAlign: "center",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            >
              <Typography variant="h6" style={{ fontWeight: 600 }}>
                {predictionScore !== undefined
                  ? `Score: ${predictionScore}%`
                  : "No prediction score available"}
              </Typography>
              <Typography
                variant="body2"
                style={{ marginTop: "12px", color: "#555" }}
              >
                {predictionScore !== undefined
                  ? predictionScore > 70
                    ? "This looks highly suspicious!"
                    : predictionScore > 50
                      ? "Medium likelihood of AI involvement."
                      : predictionScore > 30
                        ? "Low likelihood of AI involvement."
                        : "Content appears authentic."
                  : ""}
              </Typography>
            </DialogContent>
            <DialogActions
              style={{ justifyContent: "center", padding: "12px" }}
            >
              <Button
                onClick={handleDialogClose}
                variant="contained"
                style={{
                  backgroundColor: theme.palette.primary.main,
                  color: "#fff",
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Container>
    </FormProvider>
  );
}

export default withPageRequiredAuth(AssignmentSubmissionDetails, {
  roles: [RoleEnum.ADMIN, RoleEnum.TEACHER],
});
