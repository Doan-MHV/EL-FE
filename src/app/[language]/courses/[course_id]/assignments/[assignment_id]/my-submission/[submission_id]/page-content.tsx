"use client";

import { useGetAssignmentSubmissionService } from "@/services/api/services/assignment-submission";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { AssignmentSubmission } from "@/services/api/types/assignment-submission";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import { useParams } from "next/navigation";
import { EmbedPDF } from "@simplepdf/react-embed-pdf";
import { STORAGE_URL } from "@/services/api/config";
import { usePostAIService } from "@/services/api/services/ai";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

function MyAssignmentSubmissionDetails() {
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

  return (
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
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(MyAssignmentSubmissionDetails, {
  roles: [RoleEnum.USER],
});
