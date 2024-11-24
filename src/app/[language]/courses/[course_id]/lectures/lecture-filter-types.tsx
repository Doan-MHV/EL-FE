import { Course } from "@/services/api/types/course";
import { Lecture } from "@/services/api/types/lecture";
import { SortEnum } from "@/services/api/types/sort-type";

export type LectureFilterType = {
  courses?: Course[];
};

export type LectureSortType = {
  orderBy: keyof Lecture;
  order: SortEnum;
};
