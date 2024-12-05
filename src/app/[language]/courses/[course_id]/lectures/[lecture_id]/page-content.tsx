"use client";

import { useGetLectureService } from "@/services/api/services/lecture";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { Lecture } from "@/services/api/types/lecture";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { Button, Container, Grid, Typography } from "@mui/material";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

function LectureDetails() {
  const params = useParams();
  const router = useRouter();
  const lectureId = Array.isArray(params.lecture_id)
    ? params.lecture_id[0]
    : params.lecture_id;
  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;
  const fetchGetLecture = useGetLectureService();
  const { enqueueSnackbar } = useSnackbar();

  const [lecture, setLecture] = useState<Lecture>();
  const [status, setStatus] = useState(HTTP_CODES_ENUM.NOT_FOUND);

  useEffect(() => {
    const getLectureData = async () => {
      try {
        const response = await fetchGetLecture({ id: lectureId });
        if (response.status === HTTP_CODES_ENUM.OK) {
          setLecture(response.data);
          setStatus(response.status);
        }
      } catch (error) {
        enqueueSnackbar("Failed to fetch lecture details", {
          variant: "error",
        });
        setStatus(HTTP_CODES_ENUM.SERVICE_UNAVAILABLE);
      }
    };

    getLectureData();
  }, [lectureId, fetchGetLecture, enqueueSnackbar]);

  const handleNavigation = (lectureId: string | undefined) => {
    if (lectureId) {
      router.push(`/courses/${courseId}/lectures/${lectureId}`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid
        container
        direction="column"
        spacing={2}
        sx={{ mb: 2, mt: 3, px: 2 }}
      >
        <Grid item xs={12}>
          <Typography variant="h3">Lecture Details</Typography>
          <Typography variant="h3">{lecture?.lectureName}</Typography>
        </Grid>
        <Grid item xs={12} mb={5}>
          <div data-color-mode="light">
            <MarkdownPreview source={lecture?.markdownContent} />
          </div>
        </Grid>
        <Grid
          item
          container
          spacing={2}
          justifyContent="space-between"
          wrap="wrap"
        >
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleNavigation(lecture?.previousLecture)}
              disabled={!lecture?.previousLecture}
            >
              Previous Lecture
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleNavigation(lecture?.nextLecture)}
              disabled={!lecture?.nextLecture}
            >
              Next Lecture
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(LectureDetails);
