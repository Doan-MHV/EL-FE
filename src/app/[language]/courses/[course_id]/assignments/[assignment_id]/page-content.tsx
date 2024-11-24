"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "notistack";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
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
import MarkdownPreview from "@uiw/react-markdown-preview";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import { useGetAssignmentService } from "@/services/api/services/assignment";
import { Assignment } from "@/services/api/types/assignment";
import { AssignmentMaterial } from "@/services/api/types/assignment-material";
import styled from "@emotion/styled";
import { SortEnum } from "@/services/api/types/sort-type";
import useAuth from "@/services/auth/use-auth";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Lecture } from "@/services/api/types/lecture";
import {
  AssignmentMaterialFilterType,
  AssignmentMaterialSortType,
} from "@/app/[language]/courses/[course_id]/assignments/[assignment_id]/assignment-material-filter-type";
import {
  assignmentMaterialsQueryKeys,
  useAssignmentMaterialListQuery,
} from "@/app/[language]/courses/[course_id]/assignments/[assignment_id]/queries/assignment-material-queries";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { TableVirtuoso } from "react-virtuoso";
import TableComponents from "@/components/table/table-components";
import { STORAGE_URL } from "@/services/api/config";
import Link from "@/components/link";

type AssignmentMaterialsKeys = keyof AssignmentMaterial;

const TableCellLoadingContainer = styled(TableCell)(() => ({
  padding: 0,
}));

function TableSortCellWrapper(
  props: PropsWithChildren<{
    width?: number;
    orderBy: AssignmentMaterialsKeys;
    order: SortEnum;
    column: AssignmentMaterialsKeys;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: AssignmentMaterialsKeys
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
  assignmentMaterial,
}: {
  assignmentMaterial: AssignmentMaterial;
}) {
  const [open, setOpen] = useState(false);
  const { user: authUser } = useAuth();
  const { confirmDialog } = useConfirmDialog();
  const queryClient = useQueryClient();
  const anchorRef = useRef<HTMLDivElement>(null);
  const canDelete =
    assignmentMaterial?.assignment?.course?.courseCreator?.id !== authUser?.id;
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

      let filter: AssignmentMaterialFilterType | undefined = undefined;
      let sort: AssignmentMaterialSortType | undefined = {
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
        InfiniteData<{ nextPage: number; data: Lecture[] }>
      >(assignmentMaterialsQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: assignmentMaterialsQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data.filter((item) => item.id !== assignmentMaterial.id),
        })),
      };

      queryClient.setQueryData(
        assignmentMaterialsQueryKeys.list().sub.by({ sort, filter }).key,
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
      href={`${STORAGE_URL}${assignmentMaterial?.file?.path}`}
      target="_blank"
      rel="noopener noreferrer"
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

function AssignmentDetails() {
  const params = useParams();
  const assignmentId = Array.isArray(params.assignment_id)
    ? params.assignment_id[0]
    : params.assignment_id;
  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;
  const searchParams = useSearchParams();
  const router = useRouter();
  const fetchAssignment = useGetAssignmentService();
  const { enqueueSnackbar } = useSnackbar();
  const [assignment, setAssignment] = useState<Assignment>();
  const [status, setStatus] = useState(HTTP_CODES_ENUM.NOT_FOUND);
  const [{ order, orderBy }, setSort] = useState<{
    order: SortEnum;
    orderBy: AssignmentMaterialsKeys;
  }>(() => {
    const searchParamsSort = searchParams.get("sort");
    if (searchParamsSort) {
      return JSON.parse(searchParamsSort);
    }
    return { order: SortEnum.DESC, orderBy: "id" };
  });

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: AssignmentMaterialsKeys
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
    useAssignmentMaterialListQuery({
      filter: {
        assignments: [
          {
            id: assignmentId,
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
      (data?.pages.flatMap((page) => page?.data) as AssignmentMaterial[]) ??
      ([] as AssignmentMaterial[]);

    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  const getAssignmentData = useCallback(async () => {
    try {
      const response = await fetchAssignment({ id: assignmentId });
      if (response.status === HTTP_CODES_ENUM.OK) {
        setAssignment(response.data);
        setStatus(response.status);
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch assignment details", {
        variant: "error",
      });
      setStatus(HTTP_CODES_ENUM.SERVICE_UNAVAILABLE);
    }
  }, [assignmentId, fetchAssignment, enqueueSnackbar]);

  useEffect(() => {
    getAssignmentData().then();
  }, [getAssignmentData]);

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" spacing={3} mt={2} mb={2}>
        <Grid item xs={12}>
          <Typography variant="h3">Assignment Details</Typography>
          <Typography variant="h3">{assignment?.name}</Typography>
        </Grid>
        <Grid item xs={12} mb={5}>
          <div data-color-mode="light">
            <MarkdownPreview source={assignment?.description} />
          </div>
        </Grid>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs>
            <Typography variant="h5">ASSIGNMENT MATERIAL</Typography>
          </Grid>
          <Grid container item xs="auto" wrap="nowrap" spacing={2}>
            {/* <Grid item xs="auto"> */}
            {/*   <CourseFilter /> */}
            {/* </Grid> */}
            <Grid item xs="auto">
              <Button
                variant="contained"
                LinkComponent={Link}
                href={`/courses/${courseId}/assignments/${assignmentId}/list-submission`}
                color="success"
              >
                LIST SUBMISSIONS
              </Button>
            </Grid>
          </Grid>
          <Grid container item xs="auto" wrap="nowrap" spacing={2}>
            <Grid item xs="auto">
              <Button
                variant="contained"
                LinkComponent={Link}
                href={`/courses/${courseId}/assignments/${assignmentId}/create`}
                color="success"
              >
                CREATE ASSIGNMENT MATERIAL
              </Button>
            </Grid>
          </Grid>

          <Grid container item xs="auto" wrap="nowrap" spacing={2}>
            <Grid item xs="auto">
              <Button
                variant="contained"
                LinkComponent={Link}
                href={`/courses/${courseId}/assignments/${assignmentId}/create-submission`}
                color="success"
              >
                CREATE ASSIGNMENT SUBMISSION
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
                  <TableCell style={{ width: 50 }}>Name</TableCell>
                  <TableSortCellWrapper
                    width={100}
                    orderBy={orderBy}
                    order={order}
                    column="id"
                    handleRequestSort={handleRequestSort}
                  >
                    Type
                  </TableSortCellWrapper>
                  <TableCell style={{ width: 200 }}></TableCell>
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
            itemContent={(index, assignmentMaterial) => (
              <>
                <TableCell style={{ width: 200 }}>
                  {assignmentMaterial?.name}
                </TableCell>
                <TableCell>
                  {assignmentMaterial?.file?.path
                    ? assignmentMaterial.file.path.split(".").pop()
                    : "N/A"}
                </TableCell>
                <TableCell style={{ width: 130 }}>
                  <Actions assignmentMaterial={assignmentMaterial} />
                </TableCell>
              </>
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(AssignmentDetails, {
  roles: [RoleEnum.ADMIN],
});
