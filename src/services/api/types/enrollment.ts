import { User } from "./user";
import { Course } from "@/services/api/types/course";

export type Enrollment = {
  id: string;
  student?: User;
  course?: Course;
};
