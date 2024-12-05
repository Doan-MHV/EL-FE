import { User } from "@/services/api/types/user";
import { Quiz } from "@/services/api/types/quiz";
import { Assignment } from "@/services/api/types/assignment";
import { Course } from "@/services/api/types/course";

export type Grade = {
  id: string;
  name?: string;
  feedback?: string;
  grade?: number;
  maxGrade?: number;
  student?: User;
  assignment?: Assignment;
  quiz?: Quiz;
  course?: Course;
  createdAt?: Date;
  updatedAt?: Date;
};
