import { Course } from "@/services/api/types/course";
import { SortEnum } from "@/services/api/types/sort-type";
import { User } from "@/services/api/types/user";

export type CourseFilterType = {
  courseCreators?: User[];
};

export type CourseSortType = {
  orderBy: keyof Course;
  order: SortEnum;
};
