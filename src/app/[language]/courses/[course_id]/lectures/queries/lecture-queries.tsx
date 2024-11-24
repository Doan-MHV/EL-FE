import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { LectureFilterType, LectureSortType } from "../lecture-filter-types";
import { useGetLecturesService } from "@/services/api/services/lecture";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useInfiniteQuery } from "@tanstack/react-query";

export const lecturesQueryKeys = createQueryKeys(["lectures"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: LectureFilterType | undefined;
        sort?: LectureSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useLectureListQuery = ({
  sort,
  filter,
}: {
  filter?: LectureFilterType | undefined;
  sort?: LectureSortType | undefined;
} = {}) => {
  const fetch = useGetLecturesService();

  const query = useInfiniteQuery({
    queryKey: lecturesQueryKeys.list().sub.by({ sort, filter }).key,
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
