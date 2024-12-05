import { Course } from "./course";

export type Quiz = {
  id: string;
  title?: string;
  course?: Course;
  isTaken?: boolean;
};
