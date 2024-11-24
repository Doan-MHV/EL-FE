import { useCallback } from "react";
import { Assignment } from "../types/assignment";
import { AssignmentMaterial } from "../types/assignment-material";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type AssignmentMaterialsRequest = {
  page: number;
  limit: number;
  filters?: {
    assignments?: Assignment[];
  };
  sort?: Array<{ orderBy: keyof AssignmentMaterial; order: SortEnum }>;
};

export type AssignmentMaterialsResponse =
  InfinityPaginationType<AssignmentMaterial>;

export function useGetAssignmentMaterialsService() {
  const fetch = useFetch();

  return useCallback(
    (data: AssignmentMaterialsRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/assignment-materials`);
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
      }).then(wrapperFetchJsonResponse<AssignmentMaterialsResponse>);
    },
    [fetch]
  );
}

export type AssignmentMaterialPostRequest = Pick<
  AssignmentMaterial,
  "name" | "description" | "file" | "assignment"
>;

export type AssignmentMaterialPostResponse = AssignmentMaterial;

export function usePostAssignmentMaterialService() {
  const fetch = useFetch();

  return useCallback(
    (
      data: AssignmentMaterialPostRequest,
      requestConfig?: RequestConfigType
    ) => {
      console.log(data);
      return fetch(`${API_URL}/v1/assignment-materials`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AssignmentMaterialPostResponse>);
    },
    [fetch]
  );
}
