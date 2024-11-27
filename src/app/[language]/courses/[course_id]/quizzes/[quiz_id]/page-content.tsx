"use client";

import { QuizQuestion } from "@/services/api/types/quiz-question";
import styled from "@emotion/styled";
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Container,
  Grid,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  TableCell,
  TableSortLabel,
  Typography,
} from "@mui/material";
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SortEnum } from "@/services/api/types/sort-type";
import useAuth from "@/services/auth/use-auth";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Quiz } from "@/services/api/types/quiz";
import {
  QuizQuestionFilterType,
  QuizQuestionSortType,
} from "@/app/[language]/courses/[course_id]/quizzes/[quiz_id]/quiz-question-filter-type";
import {
  quizQuestionsQueryKeys,
  useQuizQuestionListQuery,
} from "@/app/[language]/courses/[course_id]/quizzes/[quiz_id]/queries/quiz-queston-queries";
import Link from "@/components/link";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetQuizService } from "@/services/api/services/quiz";
import { useSnackbar } from "notistack";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import MultipleChoiceQuestion from "@/components/multiple-choice-question";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

type QuizQuestionsKeys = keyof QuizQuestion;

const TableCellLoadingContainer = styled(TableCell)(() => ({
  padding: 0,
}));

function TableSortCellWrapper(
  props: PropsWithChildren<{
    width?: number;
    orderBy: QuizQuestionsKeys;
    order: SortEnum;
    column: QuizQuestionsKeys;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: QuizQuestionsKeys
    ) => void;
  }>
) {
  return (
    <TableCell
      style={{ width: props.width }}
      sortDirection={props.orderBy === props.column ? props.order : false}
    >
      <TableSortLabel
        active={props.orderBy === props.column}
        direction={props.orderBy === props.column ? props.order : SortEnum.ASC}
        onClick={(event) => props.handleRequestSort(event, props.column)}
      >
        {props.children}
      </TableSortLabel>
    </TableCell>
  );
}

function Actions({
  quizQuestion,
  quiz,
}: {
  quizQuestion?: QuizQuestion;
  quiz?: Quiz;
}) {
  const [open, setOpen] = useState(false);
  const { user: authUser } = useAuth();
  const { confirmDialog } = useConfirmDialog();
  const queryClient = useQueryClient();
  const anchorRef = useRef<HTMLDivElement>(null);
  const canDelete = quiz?.course?.courseCreator?.id !== authUser?.id;
  const { t: tUsers } = useTranslation("admin-panel-users");

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleDelete = async () => {
    const isConfirmed = await confirmDialog({
      title: tUsers("admin-panel-users:confirm.delete.title"),
      message: tUsers("admin-panel-users:confirm.delete.message"),
    });

    if (isConfirmed) {
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsFilter = searchParams.get("filter");
      const searchParamsSort = searchParams.get("sort");

      let filter: QuizQuestionFilterType | undefined = undefined;
      let sort: QuizQuestionSortType | undefined = {
        order: SortEnum.DESC,
        orderBy: "id",
      };

      if (searchParamsFilter) {
        filter = JSON.parse(searchParamsFilter);
      }

      if (searchParamsSort) {
        sort = JSON.parse(searchParamsSort);
      }

      const previousData = queryClient.getQueryData<
        InfiniteData<{ nextPage: number; data: QuizQuestion[] }>
      >(quizQuestionsQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: quizQuestionsQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data.filter((item) => item.id !== quizQuestion?.id),
        })),
      };

      queryClient.setQueryData(
        quizQuestionsQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      // await fetchUserDelete({
      //   id: user.id,
      // });
    }
  };

  const mainButton = (
    <Button size="small" variant="contained" LinkComponent={Link} href={``}>
      View
    </Button>
  );

  return (
    <>
      {[!canDelete].every(Boolean) ? (
        mainButton
      ) : (
        <ButtonGroup
          variant="contained"
          ref={anchorRef}
          aria-label="split button"
          size="small"
        >
          {mainButton}

          <Button
            size="small"
            aria-controls={open ? "split-button-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
      )}
      <Popper
        sx={{
          zIndex: 1,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {canDelete && (
                    <MenuItem
                      sx={{
                        bgcolor: "error.main",
                        "&:hover": {
                          bgcolor: "error.light",
                        },
                      }}
                      onClick={handleDelete}
                    >
                      {tUsers("admin-panel-users:actions.delete")}
                    </MenuItem>
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

function QuizDetails() {
  const params = useParams();
  const quizId = Array.isArray(params.quiz_id)
    ? params.quiz_id[0]
    : params.quiz_id;
  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;
  const searchParams = useSearchParams();
  const router = useRouter();
  const fetchQuiz = useGetQuizService();
  const { enqueueSnackbar } = useSnackbar();
  const [quiz, setQuiz] = useState<Quiz>();
  const [correctAnswers, setCorrectAnswers] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [status, setStatus] = useState(HTTP_CODES_ENUM.NOT_FOUND);
  const [{ order, orderBy }, setSort] = useState<{
    order: SortEnum;
    orderBy: QuizQuestionsKeys;
  }>(() => {
    const searchParamsSort = searchParams.get("sort");
    if (searchParamsSort) {
      return JSON.parse(searchParamsSort);
    }
    return { order: SortEnum.DESC, orderBy: "id" };
  });

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: QuizQuestionsKeys
  ) => {
    const isAsc = orderBy === property && order === SortEnum.ASC;
    const searchParams = new URLSearchParams(window.location.search);
    const newOrder = isAsc ? SortEnum.DESC : SortEnum.ASC;
    const newOrderBy = property;
    searchParams.set(
      "sort",
      JSON.stringify({ order: newOrder, orderBy: newOrderBy })
    );
    setSort({
      order: newOrder,
      orderBy: newOrderBy,
    });
    router.push(window.location.pathname + "?" + searchParams.toString());
  };

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useQuizQuestionListQuery({
      filter: {
        quizzes: [quizId],
      },
      sort: { order, orderBy },
    });

  // const handleScroll = useCallback(() => {
  //   if (!hasNextPage || isFetchingNextPage) return;
  //   fetchNextPage();
  // }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data) as QuizQuestion[]) ??
      ([] as QuizQuestion[]);

    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  const getQuizData = useCallback(async () => {
    try {
      const response = await fetchQuiz({ id: quizId });
      if (response.status === HTTP_CODES_ENUM.OK) {
        setQuiz(response.data);
        setStatus(response.status);
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch assignment details", {
        variant: "error",
      });
      setStatus(HTTP_CODES_ENUM.SERVICE_UNAVAILABLE);
    }
  }, [quizId, fetchQuiz, enqueueSnackbar]);

  useEffect(() => {
    getQuizData().then();
  }, [getQuizData]);

  const handleQuizSubmit = (correctAnswersCount: number) => {
    console.log(correctAnswersCount);
    setCorrectAnswers(correctAnswersCount);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" spacing={3} mt={2} mb={2}>
        <Grid item xs={12}>
          <Typography variant="h3">Quiz Details</Typography>
          <Typography variant="h3">{quiz?.title}</Typography>
        </Grid>
        {/*<Grid item xs={12} mb={5}>*/}
        {/*  <div data-color-mode="light">*/}
        {/*    <MarkdownPreview source={assignment?.description} />*/}
        {/*  </div>*/}
        {/*</Grid>*/}
        <Grid container item spacing={3} xs={12}>
          <Grid item xs>
            <Typography variant="h5">Quiz Questions</Typography>
          </Grid>

          {/*<Grid container item xs="auto" wrap="nowrap" spacing={2}>*/}
          {/*  <Grid item xs="auto">*/}
          {/*    <Button*/}
          {/*      variant="contained"*/}
          {/*      LinkComponent={Link}*/}
          {/*      href={`/courses/${courseId}/assignments/${assignmentId}/create`}*/}
          {/*      color="success"*/}
          {/*    >*/}
          {/*      CREATE ASSIGNMENT MATERIAL*/}
          {/*    </Button>*/}
          {/*  </Grid>*/}
          {/*</Grid>*/}
        </Grid>

        <Grid item xs>
          <MultipleChoiceQuestion
            questions={result}
            onSubmit={handleQuizSubmit}
          />
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Quiz Result</DialogTitle>
        <DialogContent
          style={{
            backgroundColor:
              correctAnswers !== null
                ? correctAnswers / result.length >= 0.7
                  ? "#ccffcc" // Green
                  : correctAnswers / result.length >= 0.5
                    ? "#f0e68c" // Lime orange
                    : correctAnswers / result.length >= 0.3
                      ? "#ffe4b5" // Orange
                      : "#ffcccc" // Red
                : "#ffffff", // Default white if no score
            textAlign: "center",
          }}
        >
          <Typography variant="h5" style={{ fontWeight: "bold" }}>
            {correctAnswers !== null
              ? `Correct answers: ${correctAnswers} out of ${result.length}`
              : "No quiz result available"}
          </Typography>
          <Typography variant="body1" style={{ marginTop: "10px" }}>
            {correctAnswers !== null
              ? correctAnswers / result.length >= 0.7
                ? "Excellent!"
                : correctAnswers / result.length >= 0.5
                  ? "Good job!"
                  : correctAnswers / result.length >= 0.3
                    ? "Needs Improvement."
                    : "Poor performance. Try again."
              : ""}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default withPageRequiredAuth(QuizDetails, {
  roles: [RoleEnum.ADMIN],
});
