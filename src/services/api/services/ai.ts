import { AI } from "@/services/api/types/ai";
import useFetch from "@/services/api/use-fetch";
import { useCallback } from "react";
import { AI_URL } from "@/services/api/config";
import wrapperFetchJsonResponse from "@/services/api/wrapper-fetch-json-response";

export type AIPostRequest = Pick<AI, "text">;

export type AIPostResponse = AI;

export function usePostAIService() {
  const fetch = useFetch();

  return useCallback(
    (data: AIPostRequest) => {
      return fetch(`${AI_URL}/predict/`, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<AIPostResponse>);
    },
    [fetch]
  );
}
