import { createQueryKeys } from "@/services/react-query/query-key-factory";
import {
  GradeFilterType,
  GradeSortType,
} from "@/app/[language]/courses/[course_id]/grades/grade-filter-types";
import { useGetGradesService } from "@/services/api/services/grade";
import { useInfiniteQuery } from "@tanstack/react-query";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export const gradesQueryKey = createQueryKeys(["grades"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: GradeFilterType | undefined;
        sort?: GradeSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useGradeListQuery = ({
  sort,
  filter,
}: {
  filter?: GradeFilterType | undefined;
  sort?: GradeSortType | undefined;
} = {}) => {
  const fetch = useGetGradesService();

  const query = useInfiniteQuery({
    queryKey: gradesQueryKey.list().sub.by({ sort, filter }).key,
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