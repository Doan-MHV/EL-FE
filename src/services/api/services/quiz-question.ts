import { SortEnum } from "@/services/api/types/sort-type";
import { QuizQuestion } from "@/services/api/types/quiz-question";
import { InfinityPaginationType } from "@/services/api/types/infinity-pagination";
import useFetch from "@/services/api/use-fetch";
import { useCallback } from "react";
import { RequestConfigType } from "@/services/api/services/types/request-config";
import { API_URL } from "@/services/api/config";
import wrapperFetchJsonResponse from "@/services/api/wrapper-fetch-json-response";

export type QuizQuestionsRequest = {
  page: number;
  limit: number;
  filters?: {
    quizzes?: string[];
  };
  sort?: Array<{ orderBy: keyof QuizQuestion; order: SortEnum }>;
};

export type QuizQuestionsResponse = InfinityPaginationType<QuizQuestion>;

export function useGetQuizQuestionsService() {
  const fetch = useFetch();

  return useCallback(
    (data: QuizQuestionsRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/quiz-questions`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        requestUrl.searchParams.append("filters", JSON.stringify(data.filters));
      }
      if (data.sort) {
        requestUrl.searchParams.append("sort", JSON.stringify(data.sort));
      }

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<QuizQuestionsResponse>);
    },
    [fetch]
  );
}

export type QuizQuestionPostRequest = Pick<
  QuizQuestion,
  "questionText" | "options" | "answer" | "quizId"
>;

export type QuizQuestionPostResponse = QuizQuestion;

export function usePostQuizQuestionPostService() {
  const fetch = useFetch();

  return useCallback(
    (data: QuizQuestionPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/quiz-questions`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<QuizQuestionPostResponse>);
    },
    [fetch]
  );
}
