import { Assignment } from "@/services/api/types/assignment";
import { SortEnum } from "@/services/api/types/sort-type";
import { AssignmentSubmission } from "@/services/api/types/assignment-submission";
import { InfinityPaginationType } from "@/services/api/types/infinity-pagination";
import useFetch from "@/services/api/use-fetch";
import { useCallback } from "react";
import { RequestConfigType } from "@/services/api/services/types/request-config";
import { API_URL } from "@/services/api/config";
import wrapperFetchJsonResponse from "@/services/api/wrapper-fetch-json-response";

export type AssignmentSubmissionsRequest = {
  page: number;
  limit: number;
  filters?: {
    assignments?: Assignment[];
  };
  sort?: Array<{ orderBy: keyof AssignmentSubmission; order: SortEnum }>;
};

export type AssignmentSubmissionsResponse =
  InfinityPaginationType<AssignmentSubmission>;

export function useGetAssignmentSubmissionsService() {
  const fetch = useFetch();

  return useCallback(
    (data: AssignmentSubmissionsRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/assignment-submissions`);
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
      }).then(wrapperFetchJsonResponse<AssignmentSubmissionsResponse>);
    },
    [fetch]
  );
}

export type AssignmentSubmissionRequest = {
  id: AssignmentSubmission["id"];
};

export type AssignmentSubmissionResponse = AssignmentSubmission;

export function useGetAssignmentSubmissionService() {
  const fetch = useFetch();

  return useCallback(
    (data: AssignmentSubmissionRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/assignment-submissions/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AssignmentSubmissionResponse>);
    },
    [fetch]
  );
}

export type AssignmentSubmissionPostRequest = Pick<
  AssignmentSubmission,
  "assignment" | "status" | "student" | "file"
>;

export type AssignmentSubmissionPostResponse = AssignmentSubmission;

export function usePostAssignmentSubmissionService() {
  const fetch = useFetch();

  return useCallback(
    (
      data: AssignmentSubmissionPostRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/assignment-submissions`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AssignmentSubmissionPostResponse>);
    },
    [fetch]
  );
}
