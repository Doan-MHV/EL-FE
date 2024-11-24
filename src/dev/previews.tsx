import { ComponentPreview, Previews } from "@react-buddy/ide-toolbox";
import { PaletteTree } from "./palette";
import Courses from "@/app/[language]/courses/page-content";
import FormFileUploadInput from "@/components/form/file_input/form-file-input";

const ComponentPreviews = () => {
  return (
    <Previews palette={<PaletteTree />}>
      <ComponentPreview path="/ComponentPreviews">
        <ComponentPreviews />
      </ComponentPreview>
      <ComponentPreview path="/Courses">
        <Courses />
      </ComponentPreview>
      <ComponentPreview path="/FormFileUploadInput">
        <FormFileUploadInput />
      </ComponentPreview>
    </Previews>
  );
};

export default ComponentPreviews;
