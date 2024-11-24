"use client";

import TableComponents from "@/components/table/table-components";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import {
  Button,
  Container,
  Grid,
  Link,
  TableCell,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { TableVirtuoso } from "react-virtuoso";

type TableItem = { value: string };
const tableData: TableItem[] = [
  { value: "lectures" },
  { value: "assignments" },
];

function Actions({
  courseId,
  contentType,
}: {
  courseId: string;
  contentType: string;
}) {
  const mainButton = (
    <Button
      size="small"
      variant="contained"
      LinkComponent={Link}
      href={`/courses/${courseId}/${contentType}`}
    >
      View
    </Button>
  );

  return <>{mainButton}</>;
}

function CourseDetails() {
  const params = useParams();
  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;

  return (
    <Container maxWidth="md">
      <Grid container spacing={3} pt={3}>
        <Grid container item spacing={3} xs={12}>
          <Typography variant="h3">Course Details</Typography>
        </Grid>
        <Grid item xs={12} mb={2}>
          <TableVirtuoso
            style={{ height: 500 }}
            data={tableData}
            components={TableComponents}
            overscan={20}
            itemContent={(index, courseItem) => (
              <>
                <TableCell style={{ width: 200 }}>{courseItem.value}</TableCell>
                <TableCell style={{ width: 200 }}>
                  <Actions courseId={courseId} contentType={courseItem.value} />
                </TableCell>
              </>
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(CourseDetails, { roles: [RoleEnum.ADMIN] });
