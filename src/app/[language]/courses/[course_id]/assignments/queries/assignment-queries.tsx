import { createQueryKeys } from "@/services/react-query/query-key-factory";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  AssignmentFilterType,
  AssignmentSortType,
} from "../assignment-filter-types";
import { useGetAssginemntsService } from "@/services/api/services/assignment";

export const assignmentsQueryKeys = createQueryKeys(["assignments"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: AssignmentFilterType | undefined;
        sort?: AssignmentSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useAssignmentListQuery = ({
  sort,
  filter,
}: {
  filter?: AssignmentFilterType | undefined;
  sort?: AssignmentSortType | undefined;
} = {}) => {
  const fetch = useGetAssginemntsService();

  const query = useInfiniteQuery({
    queryKey: assignmentsQueryKeys.list().sub.by({ sort, filter }).key,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { status, data } = await fetch(
        {
          page: pageParam,
          limit: 10,
          filters: filter,
          sort: sort ? [sort] : undefined,
        },
        {
          signal,
        }
      );

      if (status === HTTP_CODES_ENUM.OK) {
        return {
          data: data.data,
          nextPage: data.hasNextPage ? pageParam + 1 : undefined,
        };
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.nextPage;
    },
    gcTime: 0,
  });

  return query;
};
