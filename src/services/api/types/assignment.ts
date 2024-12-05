import { Course } from "./course";

export type Assignment = {
  id: string;
  name?: string;
  description?: string;
  maxGrade?: number;
  deadline?: Date;
  status?: string;
  course?: Course;
  hasSubmitted?: boolean;
};
