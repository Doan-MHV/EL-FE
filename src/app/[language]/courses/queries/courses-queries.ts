import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { CourseFilterType, CourseSortType } from "../course-filter-types";
import { useGetCoursesService } from "@/services/api/services/course";
import { useInfiniteQuery } from "@tanstack/react-query";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export const coursesQueryKeys = createQueryKeys(["courses"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: CourseFilterType | undefined;
        sort?: CourseSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useCourseListQuery = ({
  sort,
  filter,
}: {
  filter?: CourseFilterType | undefined;
  sort?: CourseSortType | undefined;
} = {}) => {
  const fetch = useGetCoursesService();

  const query = useInfiniteQuery({
    queryKey: coursesQueryKeys.list().sub.by({ sort, filter }).key,
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
