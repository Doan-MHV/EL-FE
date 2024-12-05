"use client";

import { Grade } from "@/services/api/types/grade";
import styled from "@emotion/styled";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  TableCell,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { SortEnum } from "@/services/api/types/sort-type";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import { useGradeListQuery } from "@/app/[language]/courses/[course_id]/grades/queries/grades-queries";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { TableVirtuoso } from "react-virtuoso";
import TableComponents from "@/components/table/table-components";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

type GradeKeys = keyof Grade;

const TableCellLoadingContainer = styled(TableCell)(() => ({
  padding: 0,
}));

function TableSortCellWrapper(
  props: React.PropsWithChildren<{
    width?: number;
    orderBy: GradeKeys;
    order: SortEnum;
    column: GradeKeys;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: GradeKeys
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

function Actions({ grade }: { grade: Grade }) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button size="small" variant="contained" onClick={handleClickOpen}>
        Show Feedback
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="feedback-dialog-title"
      >
        <DialogTitle id="feedback-dialog-title">Feedback</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {grade?.feedback || "No feedback available"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function Grades() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;

  const [{ order, orderBy }, setSort] = useState<{
    order: SortEnum;
    orderBy: GradeKeys;
  }>(() => {
    const searchParamsSort = searchParams.get("sort");
    if (searchParamsSort) {
      return JSON.parse(searchParamsSort);
    }
    return { order: SortEnum.DESC, orderBy: "id" };
  });

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: GradeKeys
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

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useGradeListQuery({
      filter: {
        courses: [
          {
            id: courseId,
          },
        ],
        students: [
          {
            id: authUser?.id ?? "",
          },
        ],
      },
    });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result = (data?.pages.flatMap((page) => page?.data) as Grade[]) ?? [];

    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  const getGradeColor = (grade: number, maxGrade: number): string => {
    const ratio = grade / maxGrade;
    if (ratio >= 0.7) return "#d4edda"; // Light green
    if (ratio >= 0.5) return "#fff3cd"; // Light yellow
    if (ratio >= 0.3) return "#ffeeba"; // Peach
    return "#f8d7da"; // Light red
  };

  const totalGrades = useMemo(() => {
    return result.reduce(
      (acc, grade) => {
        // Ensure numbers are calculated properly
        const gradeValue =
          parseFloat(String(grade.grade).replace(/[^0-9.-]+/g, "")) || 0;
        const maxGradeValue =
          parseFloat(String(grade.maxGrade).replace(/[^0-9.-]+/g, "")) || 0;

        acc.totalGrade += gradeValue;
        acc.totalMaxGrade += maxGradeValue;
        return acc;
      },
      { totalGrade: 0, totalMaxGrade: 0 }
    );
  }, [result]);

  const runningPercentage =
    totalGrades.totalMaxGrade > 0
      ? (totalGrades.totalGrade / totalGrades.totalMaxGrade) * 100
      : 0;

  return (
    <Container maxWidth="md">
      <Grid container spacing={3} pt={3}>
        <Grid item xs={12}>
          <Typography variant="h3" gutterBottom>
            My Grades
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center">
                  <CircularProgress />
                </Box>
              ) : (
                <Box textAlign="center">
                  <Typography variant="h5" component="div" gutterBottom>
                    Total Running Percentage
                  </Typography>
                  <CircularProgress
                    variant="determinate"
                    value={runningPercentage}
                    size={80}
                  />
                  <Typography variant="h4" component="div">
                    {`${runningPercentage.toFixed(2)}%`}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
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
                  <TableCell style={{ width: 50 }}>Name</TableCell>
                  <TableSortCellWrapper
                    width={100}
                    orderBy={orderBy}
                    order={order}
                    column="grade"
                    handleRequestSort={handleRequestSort}
                  >
                    Grade
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
            itemContent={(index, grade) => (
              <>
                <TableCell style={{ width: 50 }}>{grade?.name}</TableCell>
                <TableCell
                  style={{
                    width: 100,
                    background: getGradeColor(
                      grade?.grade ?? 0,
                      grade?.maxGrade ?? 0
                    ),
                  }}
                >{`${grade?.grade}/${grade.maxGrade}`}</TableCell>
                <TableCell style={{ width: 130 }}>
                  <Actions grade={grade} />
                </TableCell>
              </>
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(Grades);
