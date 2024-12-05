import { Course } from "@/services/api/types/course";
import { Grade } from "@/services/api/types/grade";
import { User } from "@/services/api/types/user";
import { SortEnum } from "@/services/api/types/sort-type";

export type GradeFilterType = {
  students?: User[];
  courses?: Course[];
};

export type GradeSortType = {
  orderBy: keyof Grade;
  order: SortEnum;
};
