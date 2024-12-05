import { Assignment } from "@/services/api/types/assignment";
import { FileEntity } from "@/services/api/types/file-entity";
import { User } from "@/services/api/types/user";
import { Grade } from "@/services/api/types/grade";

export interface AssignmentSubmission {
  id: string;
  assignment?: Assignment;
  student?: User | null;
  file?: FileEntity;
  status?: string;
  isGraded?: boolean;
  grade?: Grade | null;
  createdAt?: Date;
}
