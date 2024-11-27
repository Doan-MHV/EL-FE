import { SortEnum } from "@/services/api/types/sort-type";
import { Quiz } from "@/services/api/types/quiz";
import { Course } from "@/services/api/types/course";

export type QuizFilterTypes = {
  courses?: Course[];
};

export type QuizSortType = {
  orderBy: keyof Quiz;
  order: SortEnum;
};
