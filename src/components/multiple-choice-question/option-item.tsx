import React from "react";
import { Box, IconButton, TextField } from "@mui/material";
import { useController, useFormContext, useWatch } from "react-hook-form";
import {
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

type OptionItemProps = {
  name: string;
  index: number;
  remove: (index: number) => void;
};

const OptionItem: React.FC<OptionItemProps> = ({ name, index, remove }) => {
  const { control, setValue, getValues } = useFormContext();

  const optionField = useController({
    name: `${name}.${index}.value`,
    control,
  });

  const currentAnswer = useWatch({ control, name: "answer" });

  const handleMarkAsAnswer = () => {
    setValue("answer", optionField.field.value);
  };

  return (
    <Box display="flex" flexDirection="row" alignItems="center" width="100%">
      <TextField
        fullWidth
        label={`Option ${index + 1}`}
        variant="outlined"
        margin="normal"
        {...optionField.field}
        error={!!optionField.fieldState.error}
        helperText={optionField.fieldState.error?.message}
      />
      <IconButton color="primary" onClick={handleMarkAsAnswer}>
        <CheckCircleIcon
          color={
            currentAnswer === optionField.field.value ? "success" : "disabled"
          }
        />
      </IconButton>
      <IconButton
        color="error"
        onClick={() => remove(index)}
        disabled={getValues(name).length <= 1}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export default OptionItem;
