import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { RequestConfigType } from "./types/request-config";
import { test as Entity } from "../types/test";

export type GettestsRequest = {
  page: number;
  limit: number;
};

export type GettestsResponse = InfinityPaginationType<Entity>;

export function useGettestsService() {
  const fetch = useFetch();

  return useCallback(
    (data: GettestsRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/tests`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GettestsResponse>);
    },
    [fetch]
  );
}

export type GettestRequest = {
  id: Entity["id"];
};

export type GettestResponse = Entity;

export function useGettestService() {
  const fetch = useFetch();

  return useCallback(
    (data: GettestRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/tests/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GettestResponse>);
    },
    [fetch]
  );
}

export type CreatetestRequest = Pick<Entity, "description">;

export type CreatetestResponse = Entity;

export function useCreatetestService() {
  const fetch = useFetch();

  return useCallback(
    (data: CreatetestRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/tests`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CreatetestResponse>);
    },
    [fetch]
  );
}

export type EdittestRequest = {
  id: Entity["id"];
  data: Partial<Pick<Entity, "description">>;
};

export type EdittestResponse = Entity;

export function useEdittestService() {
  const fetch = useFetch();

  return useCallback(
    (data: EdittestRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/tests/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<EdittestResponse>);
    },
    [fetch]
  );
}

export type DeletetestRequest = {
  id: Entity["id"];
};

export type DeletetestResponse = undefined;

export function useDeletetestService() {
  const fetch = useFetch();

  return useCallback(
    (data: DeletetestRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/tests/${data.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<DeletetestResponse>);
    },
    [fetch]
  );
}
