import { Course } from "./course";

export type Assignment = {
  id: string;
  name?: string;
  description?: string;
  deadline?: Date;
  status?: string;
  course?: Course;
};
