import { Assignment } from "./assignment";
import { FileEntity } from "./file-entity";

export type AssignmentMaterial = {
  id: string;
  name: string;
  description?: string;
  file?: FileEntity;
  assignment?: Assignment;
};
