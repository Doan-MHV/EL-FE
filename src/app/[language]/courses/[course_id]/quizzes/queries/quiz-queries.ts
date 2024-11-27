import { createQueryKeys } from "@/services/react-query/query-key-factory";
import {
  QuizFilterTypes,
  QuizSortType,
} from "@/app/[language]/courses/[course_id]/quizzes/quiz-filter-types";
import { useInfiniteQuery } from "@tanstack/react-query";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useGetQuizzesService } from "@/services/api/services/quiz";

export const quizzesQueryKey = createQueryKeys(["quizzes"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: QuizFilterTypes | undefined;
        sort?: QuizSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useQuizListQuery = ({
  sort,
  filter,
}: {
  filter?: QuizFilterTypes | undefined;
  sort?: QuizSortType | undefined;
} = {}) => {
  const fetch = useGetQuizzesService();

  const query = useInfiniteQuery({
    queryKey: quizzesQueryKey.list().sub.by({ sort, filter }).key,
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
