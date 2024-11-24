import { createQueryKeys } from "@/services/react-query/query-key-factory";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  AssignmentSubmissionFilterType,
  AssignmentSubmissionSortType,
} from "../assignment-submission-filter-type";
import { useGetAssignmentSubmissionsService } from "@/services/api/services/assignment-submission";

export const assignmentSubmissionsQueryKeys = createQueryKeys(
  ["assignmentSubmissions"],
  {
    list: () => ({
      key: [],
      sub: {
        by: ({
          sort,
          filter,
        }: {
          filter: AssignmentSubmissionFilterType | undefined;
          sort?: AssignmentSubmissionSortType | undefined;
        }) => ({
          key: [sort, filter],
        }),
      },
    }),
  }
);

export const useAssignmentSubmissionListQuery = ({
  sort,
  filter,
}: {
  filter?: AssignmentSubmissionFilterType | undefined;
  sort?: AssignmentSubmissionSortType | undefined;
} = {}) => {
  const fetch = useGetAssignmentSubmissionsService();

  const fetchAssignmentSubmissions = async ({
    pageParam,
    signal,
  }: {
    pageParam: number;
    signal: AbortSignal | null;
  }) => {
    const requestParams = {
      page: pageParam,
      limit: 10,
      filters: filter,
      sort: sort ? [sort] : undefined,
    };

    const config = { signal };
    const { status, data } = await fetch(requestParams, config);

    if (status === HTTP_CODES_ENUM.OK) {
      return {
        data: data.data,
        nextPage: data.hasNextPage ? pageParam + 1 : undefined,
      };
    }

    throw new Error("Failed to fetch assignment materials");
  };

  return useInfiniteQuery({
    queryKey: assignmentSubmissionsQueryKeys.list().sub.by({ sort, filter })
      .key,
    initialPageParam: 1,
    queryFn: fetchAssignmentSubmissions,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    gcTime: 0,
  });
};
