import { User } from "@/services/api/types/user";
import { SortEnum } from "@/services/api/types/sort-type";
import { InfinityPaginationType } from "@/services/api/types/infinity-pagination";
import { Grade } from "@/services/api/types/grade";
import useFetch from "@/services/api/use-fetch";
import { useCallback } from "react";
import { RequestConfigType } from "@/services/api/services/types/request-config";
import { API_URL } from "@/services/api/config";
import wrapperFetchJsonResponse from "@/services/api/wrapper-fetch-json-response";
import { Course } from "@/services/api/types/course";

export type GradesRequest = {
  page: number;
  limit: number;
  filters?: {
    students?: User[];
    courses?: Course[];
  };
  sort?: Array<{
    orderBy: keyof Grade;
    order: SortEnum;
  }>;
};

export type GradesResponse = InfinityPaginationType<Grade>;

export function useGetGradesService() {
  const fetch = useFetch();

  return useCallback(
    (data: GradesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/grades/`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        requestUrl.searchParams.append("filters", JSON.stringify(data.filters));
      }

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GradesResponse>);
    },
    [fetch]
  );
}

export type GradePostRequest = Pick<
  Grade,
  | "name"
  | "student"
  | "feedback"
  | "assignment"
  | "grade"
  | "maxGrade"
  | "quiz"
  | "course"
>;

export type GradePostResponse = Grade;

export function usePostGradeService() {
  const fetch = useFetch();
  return useCallback(
    (data: GradePostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/grades`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GradePostResponse>);
    },
    [fetch]
  );
}
