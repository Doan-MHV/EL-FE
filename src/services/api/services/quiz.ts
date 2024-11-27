import { Course } from "@/services/api/types/course";
import { SortEnum } from "@/services/api/types/sort-type";
import { Quiz } from "@/services/api/types/quiz";
import { InfinityPaginationType } from "@/services/api/types/infinity-pagination";
import useFetch from "@/services/api/use-fetch";
import { useCallback } from "react";
import { RequestConfigType } from "@/services/api/services/types/request-config";
import { API_URL } from "@/services/api/config";
import wrapperFetchJsonResponse from "@/services/api/wrapper-fetch-json-response";

export type QuizzesRequest = {
  page: number;
  limit: number;
  filters?: {
    courses?: Course[];
  };
  sort?: Array<{ orderBy: keyof Quiz; order: SortEnum }>;
};

export type QuizzesResponse = InfinityPaginationType<Quiz>;

export function useGetQuizzesService() {
  const fetch = useFetch();

  return useCallback(
    (data: QuizzesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/quizzes`);
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
      }).then(wrapperFetchJsonResponse<QuizzesResponse>);
    },
    [fetch]
  );
}

export type QuizRequest = {
  id: Quiz["id"];
};

export type QuizResponse = Quiz;

export function useGetQuizService() {
  const fetch = useFetch();

  return useCallback(
    (data: QuizRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/quizzes/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<QuizResponse>);
    },
    [fetch]
  );
}

export type QuizPostRequest = Pick<Quiz, "title" | "course">;

export type QuizPostResponse = Quiz;

export function usePostQuizService() {
  const fetch = useFetch();

  return useCallback(
    (data: QuizPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/quizzes`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<QuizPostResponse>);
    },
    [fetch]
  );
}
