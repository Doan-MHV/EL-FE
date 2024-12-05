"use client";

import { FileEntity } from "@/services/api/types/file-entity";
import { Assignment } from "@/services/api/types/assignment";
import * as yup from "yup";
import {
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { Box, Button, Container, Grid, Link, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { yupResolver } from "@hookform/resolvers/yup";
import { usePostAssignmentMaterialService } from "@/services/api/services/assignment-material";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { t } from "i18next";
import FormTextInput from "@/components/form/text-input/form-text-input";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import FormFileInput from "@/components/form/file_input/form-file-input";
import { useEffect } from "react";

type CreateAssignmentMaterialFormData = {
  name: string;
  description?: string;
  file?: FileEntity;
  assignment?: Assignment;
};

const useValidationSchema = () => {
  return yup.object().shape({
    name: yup.string().required("Assignment Material name is required"),
  });
};

function CreateAssignmentMaterialFormActions() {
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      Submit
    </Button>
  );
}

function HandleFileChange() {
  const { setValue } = useFormContext<CreateAssignmentMaterialFormData>();

  const file = useWatch({ name: "file" });

  useEffect(() => {
    if (file) {
      let fileName = file.localName || "";

      // Remove the file extension
      const extensionIndex = fileName.lastIndexOf(".");
      if (extensionIndex > 0) {
        fileName = fileName.substring(0, extensionIndex);
      }

      setValue("name", fileName);
    }
  }, [file, setValue]);

  return null;
}

function FormCreateAssignmentMaterial() {
  const router = useRouter();
  const params = useParams();
  const fetchPostAssignmentMaterial = usePostAssignmentMaterialService();
  const validationSchema = useValidationSchema();

  const assignmentId = Array.isArray(params.assignment_id)
    ? params.assignment_id[0]
    : params.assignment_id;

  const courseId = Array.isArray(params.course_id)
    ? params.course_id[0]
    : params.course_id;

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateAssignmentMaterialFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      description: "",
      file: undefined,
      assignment: {
        id: assignmentId,
      },
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchPostAssignmentMaterial(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (
        Object.keys(data.errors) as Array<
          keyof CreateAssignmentMaterialFormData
        >
      ).forEach((key) => {
        setError(key, {
          type: "manual",
          message: t(`External server error ${key}: ${data.errors[key]}`),
        });
      });
      return;
    }

    if (status === HTTP_CODES_ENUM.CREATED) {
      enqueueSnackbar("Create assignment material successfully", {
        variant: "success",
      });
      router.push(`/courses/${courseId}/assignments/${assignmentId}`);
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="lg">
        <form onSubmit={onSubmit} autoComplete="create-new-lecture">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Create Assignment Material</Typography>
            </Grid>

            <HandleFileChange />

            <Grid item xs={12}>
              <FormTextInput<CreateAssignmentMaterialFormData>
                name="name"
                testId="new-assignment-material-name"
                autoComplete="new-assignment-material-name"
                label="Name"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateAssignmentMaterialFormData>
                name="description"
                testId="new-assignment-material-description"
                autoComplete="new-assignment-material-description"
                label="Description"
              />
            </Grid>

            <Grid item xs={12}>
              <FormFileInput<CreateAssignmentMaterialFormData>
                name="file"
                testId="file"
              />
            </Grid>

            <Grid item xs={12}>
              <CreateAssignmentMaterialFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href={`/courses/${courseId}/assignments/${assignmentId}`}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateAssignmentMaterial() {
  return <FormCreateAssignmentMaterial />;
}

export default withPageRequiredAuth(CreateAssignmentMaterial);
