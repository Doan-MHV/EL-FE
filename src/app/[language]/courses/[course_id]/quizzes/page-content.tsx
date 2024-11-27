"use client";

import { Quiz } from "@/services/api/types/quiz";
import styled from "@emotion/styled";
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Container,
  Grid,
  Grow,
  LinearProgress,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  TableCell,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import React, {
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { SortEnum } from "@/services/api/types/sort-type";
import { useTranslation } from "react-i18next";
import useAuth from "@/services/auth/use-auth";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import {
  QuizFilterTypes,
  QuizSortType,
} from "@/app/[language]/courses/[course_id]/quizzes/quiz-filter-types";
import {
  quizzesQueryKey,
  useQuizListQuery,
} from "@/app/[language]/courses/[course_id]/quizzes/queries/quiz-queries";
import Link from "@/components/link";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { TableVirtuoso } from "react-virtuoso";
import TableComponents from "@/components/table/table-components";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";

type QuizzesKeys = keyof Quiz;

const TableCellLoadingContainer = styled(TableCell)(() => ({
  padding: 0,
}));

function TableSortCellWrapper(
  props: PropsWithChildren<{
    width?: number;
    orderBy: QuizzesKeys;
    order: SortEnum;
    column: QuizzesKeys;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: QuizzesKeys
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

function Actions({ courseId, quiz }: { courseId: string; quiz: Quiz }) {
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

      let filter: QuizFilterTypes | undefined = undefined;
      let sort: QuizSortType | undefined = {
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
        InfiniteData<{ nextPage: number; data: Quiz[] }>
      >(quizzesQueryKey.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: quizzesQueryKey.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data.filter((item) => item.id !== quiz.id),
        })),
      };

      queryClient.setQueryData(
        quizzesQueryKey.list().sub.by({ sort, filter }).key,
        newData
      );

      // await fetchUserDelete({
      //   id: user.id,
      // });
    }
  };

  const mainButton = (
    <Button
      size="small"
      variant="contained"
      LinkComponent={Link}
      href={`/courses/${courseId}/quizzes/${quiz.id}`}
    >
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

function Quizzes() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;

  const [{ order, orderBy }, setSort] = useState<{
    order: SortEnum;
    orderBy: QuizzesKeys;
  }>(() => {
    const searchParamsSort = searchParams.get("sort");
    if (searchParamsSort) {
      return JSON.parse(searchParamsSort);
    }
    return { order: SortEnum.DESC, orderBy: "id" };
  });

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: QuizzesKeys
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
    useQuizListQuery({
      filter: {
        courses: [
          {
            id: courseId,
          },
        ],
      },
      sort: { order, orderBy },
    });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data) as Quiz[]) ?? ([] as Quiz[]);

    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  return (
    <Container maxWidth="md">
      <Grid container spacing={3} pt={3}>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs>
            <Typography variant="h3">Assignments</Typography>
          </Grid>
          <Grid container item xs="auto" wrap="nowrap" spacing={2}>
            {/* <Grid item xs="auto"> */}
            {/*   <CourseFilter /> */}
            {/* </Grid> */}
            <Grid item xs="auto">
              <Button
                variant="contained"
                LinkComponent={Link}
                href={`/courses/${courseId}/assignments/create`}
                color="success"
              >
                CREATE ASSIGNMENT
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} mb={2}>
          <TableVirtuoso
            style={{ height: 500 }}
            data={result}
            components={TableComponents}
            endReached={handleScroll}
            overscan={20}
            fixedHeaderContent={() => (
              <>
                <TableRow>
                  <TableSortCellWrapper
                    width={100}
                    orderBy={orderBy}
                    order={order}
                    column="title"
                    handleRequestSort={handleRequestSort}
                  >
                    Name
                  </TableSortCellWrapper>
                  <TableCell style={{ width: 130 }}></TableCell>
                </TableRow>
                {isFetchingNextPage && (
                  <TableRow>
                    <TableCellLoadingContainer colSpan={6}>
                      <LinearProgress />
                    </TableCellLoadingContainer>
                  </TableRow>
                )}
              </>
            )}
            itemContent={(index, quizz) => (
              <>
                <TableCell style={{ width: 50 }}>{quizz?.title}</TableCell>
                <TableCell style={{ width: 130 }}>
                  <Actions courseId={courseId} quiz={quizz} />
                </TableCell>
              </>
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(Quizzes, { roles: [RoleEnum.ADMIN] });
