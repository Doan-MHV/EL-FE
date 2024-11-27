"use client";

import { useGetLectureService } from "@/services/api/services/lecture";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { Lecture } from "@/services/api/types/lecture";
import { RoleEnum } from "@/services/api/types/role";
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
        mb={2}
        mt={3}
        ml={8}
        mr={8}
      >
        <Grid item xs={10} md={20}>
          <Typography variant="h3">Lecture Details</Typography>
          <Typography variant="h3">{lecture?.lectureName}</Typography>
        </Grid>
        <Grid item xs={10} md={20} mb={40}>
          <div data-color-mode="light">
            <MarkdownPreview source={lecture?.markdownContent} />
          </div>
        </Grid>
        <Grid item container spacing={2} justifyContent="space-between">
          <Grid item>
            <Button
              variant="contained"
              onClick={() => handleNavigation(lecture?.previousLecture)}
              disabled={!lecture?.previousLecture}
            >
              Previous Lecture
            </Button>
          </Grid>
          <Grid item>
            <Button
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

export default withPageRequiredAuth(LectureDetails, {
  roles: [RoleEnum.ADMIN],
});
