import { Assignment } from "@/services/api/types/assignment";
import { Course } from "@/services/api/types/course";
import { SortEnum } from "@/services/api/types/sort-type";

export type AssignmentFilterType = {
  courses?: Course[];
};

export type AssignmentSortType = {
  orderBy: keyof Assignment;
  order: SortEnum;
};
