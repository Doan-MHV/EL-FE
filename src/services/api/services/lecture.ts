import { useCallback } from "react";
import { Course } from "../types/course";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { Lecture } from "../types/lecture";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import useFetch from "../use-fetch";

export type LecturesRequest = {
  page: number;
  limit: number;
  filters?: {
    courses?: Course[];
  };
  sort?: Array<{ orderBy: keyof Lecture; order: SortEnum }>;
};

export type LecturesResponse = InfinityPaginationType<Lecture>;

export function useGetLecturesService() {
  const fetch = useFetch();

  return useCallback(
    (data: LecturesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/lectures`);
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
      }).then(wrapperFetchJsonResponse<LecturesResponse>);
    },
    [fetch]
  );
}

export type LectureRequest = {
  id: Lecture["id"];
};

export type LectureResponse = Lecture;

export function useGetLectureService() {
  const fetch = useFetch();

  return useCallback(
    (data: LectureRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/lectures/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LectureResponse>);
    },
    [fetch]
  );
}

export type LecturePostRequest = Pick<
  Lecture,
  "lectureName" | "lectureTime" | "lectureDate" | "markdownContent" | "course"
>;

export type LecturePostResponse = Lecture;

export function usePostLectureService() {
  const fetch = useFetch();

  return useCallback(
    (data: LecturePostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/lectures`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LecturePostResponse>);
    },
    [fetch]
  );
}
