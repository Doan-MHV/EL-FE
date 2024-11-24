import { Lecture } from "./lecture";
import { User } from "./user";

export type Course = {
  id: string;
  courseName?: string;
  categoryType?: string;
  coursePrice?: number;
  courseCreator?: User;
  courseLecture?: [Lecture];
};
