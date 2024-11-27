import { Course } from "./course";

export type Lecture = {
  id: string;
  lectureName: string;
  lectureTime?: string;
  lectureDate?: Date;
  markdownContent?: string;
  course?: Course;
  previousLecture?: string;
  nextLecture?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
