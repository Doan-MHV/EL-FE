import { CourseFilterType } from "./course-filter-types";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";

type CourseFilterFormData = CourseFilterType;

function CourseFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<CourseFilterFormData>({
    defaultValues: {
      courseCreators: [],
    },
  });

  const { handleSubmit, reset } = methods;

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "course-filter-popover" : undefined;

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter) {
      handleClose();
      const filterParsed = JSON.parse(filter);
      reset(filterParsed);
    }
  }, [searchParams, reset]);

  return (
    <FormProvider {...methods}>
      {/* <Popover */}
      {/*   id={id} */}
      {/*   open={open} */}
      {/*   anchorEl={anchorEl} */}
      {/*   onClose={handleClose} */}
      {/*   anchorOrigin={{ */}
      {/*     vertical: "bottom", */}
      {/*     horizontal: "left", */}
      {/*   }} */}
      {/* > */}
      {/*   <Container sx={{ minWidth: 300 }}> */}
      {/*     <form */}
      {/*       onSubmit={handleSubmit((data) => { */}
      {/*         const searchParams = new URLSearchParams(window.location.search); */}
      {/*         searchParams.set("filter", JSON.stringify(data)); */}
      {/*         router.push( */}
      {/*           window.location.pathname + "?" + searchParams.toString() */}
      {/*         ); */}
      {/*       })} */}
      {/*     > */}
      {/*       <Grid container spacing={2} mb={3} mt={3}> */}
      {/*         <Grid item xs={12}> */}
      {/**/}
      {/*         </Grid> */}
      {/*       </Grid> */}
      {/*     </form> */}
      {/*   </Container> */}
      {/* </Popover> */}
      <Button>Create Course</Button>
    </FormProvider>
  );
}

export default CourseFilter;
