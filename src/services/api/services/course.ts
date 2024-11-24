import { useCallback } from "react";
import { Course } from "../types/course";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import useFetch from "../use-fetch";
import { RequestConfigType } from "./types/request-config";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { User } from "../types/user";

export type CoursesRequest = {
  page: number;
  limit: number;
  filters?: {
    courseCreators?: User[];
  };
  sort?: Array<{
    orderBy: keyof Course;
    order: SortEnum;
  }>;
};

export type CoursesResponse = InfinityPaginationType<Course>;

export function useGetCoursesService() {
  const fetch = useFetch();

  return useCallback(
    (data: CoursesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/courses/`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        requestUrl.searchParams.append("filters", JSON.stringify(data.filters));
      }

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CoursesResponse>);
    },
    [fetch]
  );
}

export type CoursePostRequest = Pick<
  Course,
  "courseName" | "categoryType" | "coursePrice" | "courseCreator"
>;

export type CoursePostResponse = Course;

export function usePostCourseService() {
  const fetch = useFetch();

  return useCallback(
    (data: CoursePostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/courses`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CoursePostResponse>);
    },
    [fetch]
  );
}
