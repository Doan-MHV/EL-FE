import { Assignment } from "@/services/api/types/assignment";
import { FileEntity } from "@/services/api/types/file-entity";
import { User } from "@/services/api/types/user";

export interface AssignmentSubmission {
  id: string;
  assignment?: Assignment;
  student?: User | null;
  file?: FileEntity;
  status?: string;
  createdAt?: Date;
}
