"use client";

import { useGetAssignmentSubmissionService } from "@/services/api/services/assignment-submission";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { AssignmentSubmission } from "@/services/api/types/assignment-submission";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  Typography,
} from "@mui/material";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import { useParams } from "next/navigation";
import { EmbedPDF } from "@simplepdf/react-embed-pdf";
import { HighlightAlt } from "@mui/icons-material";
import { STORAGE_URL } from "@/services/api/config";
import { usePostAIService } from "@/services/api/services/ai";

function AssignmentSubmissionDetails() {
  const params = useParams();
  const assignmentSubmissionId = Array.isArray(params.submission_id)
    ? params.submission_id[0]
    : params.submission_id;
  const fetchAssignmentSubmission = useGetAssignmentSubmissionService();
  const fetchPostAI = usePostAIService();
  const { enqueueSnackbar } = useSnackbar();

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

    getAssignmentSubmissionData();
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

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" spacing={2} mt={3}>
        <Grid item>
          <Typography variant="h4" gutterBottom>
            Assignment Submission Details
          </Typography>
          {assignmentSubmission?.file?.path && (
            <Typography variant="body1" color="textSecondary">
              File: {assignmentSubmission.file.path}
            </Typography>
          )}
        </Grid>

        <Grid
          item
          style={{
            position: "relative",
            height: "80vh",
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
          <HighlightAlt />
        </Fab>

        <Dialog open={openDialog} onClose={handleDialogClose}>
          <DialogTitle>Prediction Score</DialogTitle>
          <DialogContent
            style={{
              backgroundColor:
                predictionScore !== undefined
                  ? predictionScore > 70
                    ? "#ffcccc" // Red
                    : predictionScore > 50
                      ? "#ffe4b5" // Orange
                      : predictionScore > 30
                        ? "#f0e68c" // Lime orange
                        : "#ccffcc" // Green
                  : "#ffffff", // Default white if no score
              textAlign: "center",
            }}
          >
            <Typography variant="h5" style={{ fontWeight: "bold" }}>
              {predictionScore !== undefined
                ? `Score: ${predictionScore}`
                : "No prediction score available"}
            </Typography>
            <Typography variant="body1" style={{ marginTop: "10px" }}>
              {predictionScore !== undefined
                ? predictionScore > 70
                  ? "This looks highly suspicious!"
                  : predictionScore > 50
                    ? "Likelihood of AI involvement."
                    : predictionScore > 30
                      ? "Low likelihood of AI involvement."
                      : "Content appears to be authentic."
                : ""}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(AssignmentSubmissionDetails, {
  roles: [RoleEnum.ADMIN],
});
