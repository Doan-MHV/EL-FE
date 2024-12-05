import React from "react";
import { Box, Button, List, ListItem, Typography } from "@mui/material";
import { useFieldArray, useFormContext } from "react-hook-form";
import OptionItem from "@/components/multiple-choice-question/option-item";

const OptionsFieldArray: React.FC = () => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  return (
    <Box>
      <Typography variant="h6">Options</Typography>
      <List>
        {fields.map((field, index) => (
          <ListItem key={field.id}>
            <OptionItem name="options" index={index} remove={remove} />
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        onClick={() => append({ value: "" })}
      >
        Add Option
      </Button>
    </Box>
  );
};

export default OptionsFieldArray;
