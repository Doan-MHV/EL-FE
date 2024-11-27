import { SortEnum } from "@/services/api/types/sort-type";
import { QuizQuestion } from "@/services/api/types/quiz-question";

export type QuizQuestionFilterType = {
  quizzes?: string[];
};

export type QuizQuestionSortType = {
  orderBy: keyof QuizQuestion;
  order: SortEnum;
};
