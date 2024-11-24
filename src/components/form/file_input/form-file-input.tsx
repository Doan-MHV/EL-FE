import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { useTranslation } from "react-i18next";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { useFileUploadService } from "@/services/api/services/files";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { FileEntity } from "@/services/api/types/file-entity";

type FileUploadInputProps = {
  error?: string;
  onChange: (value: FileEntity | null) => void;
  onBlur: () => void;
  value?: (FileEntity & { localName?: string }) | null;
  disabled?: boolean;
  testId?: string;
  maxSize?: number;
};

const FileUploadInput: React.FC<FileUploadInputProps> = (props) => {
  const { onChange, value = null } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const fetchFileUpload = useFileUploadService();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      setIsLoading(true);
      const { status, data } = await fetchFileUpload(file);
      if (status === HTTP_CODES_ENUM.CREATED) {
        onChange({ ...data.file, localName: file.name });
      }
      setIsLoading(false);
    },
    [fetchFileUpload, onChange]
  );

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "application/pdf": [],
      "text/plain": [],
    },
    maxFiles: 1, // only allow one file
    maxSize: props.maxSize || 1024 * 1024 * 2, // 2MB default
    disabled: isLoading || props.disabled,
  });

  const removeFile = () => {
    onChange(null);
  };

  return (
    <Box
      {...getRootProps()}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "2px dashed",
        justifyContent: "center",
        padding: 2,
        borderRadius: 1,
        cursor: "pointer",
        backgroundColor: isDragActive ? "#f0f0f0" : "transparent",
        position: "relative",
        height: 150,
      }}
    >
      {isDragActive && (
        <Typography variant="h6" sx={{ color: "text.secondary" }}>
          {t("Drop Zone")}
        </Typography>
      )}
      {!isDragActive && !value && (
        <Button variant="contained" disabled={isLoading} sx={{ marginTop: 2 }}>
          {isLoading ? t("Loading") : t("Drag & Drop")}
        </Button>
      )}
      {value && (
        <List>
          <ListItem
            secondaryAction={
              <IconButton onClick={removeFile}>
                <ClearOutlinedIcon />
              </IconButton>
            }
          >
            {"File Name: " + (value.localName ?? "Unknown")}
          </ListItem>
        </List>
      )}
      {props.error && (
        <Typography sx={{ color: "red", marginTop: 1 }}>
          {props.error}
        </Typography>
      )}
    </Box>
  );
};

function FormFileUploadInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> & {
    disabled?: boolean;
    testId?: string;
  }
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <FileUploadInput
          onChange={field.onChange}
          onBlur={field.onBlur}
          value={field.value as (FileEntity & { localName?: string }) | null}
          error={fieldState.error?.message}
          disabled={props.disabled}
          testId={props.testId}
        />
      )}
    />
  );
}

export default FormFileUploadInput;
