import { useCallback } from "react";
import { Course } from "../types/course";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { Assignment } from "../types/assignment";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import useFetch from "../use-fetch";

export type AssignmentsRequest = {
  page: number;
  limit: number;
  filters?: {
    courses?: Course[];
  };
  sort?: Array<{ orderBy: keyof Assignment; order: SortEnum }>;
};

export type AssignmentsResponse = InfinityPaginationType<Assignment>;

export function useGetAssginemntsService() {
  const fetch = useFetch();

  return useCallback(
    (data: AssignmentsRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/assignments`);
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
      }).then(wrapperFetchJsonResponse<AssignmentsResponse>);
    },
    [fetch]
  );
}

export type AssignmentRequest = {
  id: Assignment["id"];
};

export type AssignmentResponse = Assignment;

export function useGetAssignmentService() {
  const fetch = useFetch();

  return useCallback(
    (data: AssignmentRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/assignments/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AssignmentResponse>);
    },
    [fetch]
  );
}

export type AssignmentPostRequest = Pick<
  Assignment,
  "name" | "description" | "deadline" | "status" | "course"
>;

export type AssignmentPostResponse = Assignment;

export function usePostAssignmentService() {
  const fetch = useFetch();

  return useCallback(
    (data: AssignmentPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/assignments`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AssignmentPostResponse>);
    },
    [fetch]
  );
}
