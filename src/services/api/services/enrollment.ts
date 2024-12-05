import { Enrollment } from "@/services/api/types/enrollment";
import useFetch from "@/services/api/use-fetch";
import wrapperFetchJsonResponse from "@/services/api/wrapper-fetch-json-response";
import { API_URL } from "@/services/api/config";
import { useCallback } from "react";
import { RequestConfigType } from "@/services/api/services/types/request-config";

export type EnrollmentPostRequest = Pick<Enrollment, "student" | "course">;

export type EnrollmentPostResponse = Enrollment;

export function usePostEnrollmentService() {
  const fetch = useFetch();

  return useCallback(
    (data: EnrollmentPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/enrollments`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<EnrollmentPostResponse>);
    },
    [fetch]
  );
}
