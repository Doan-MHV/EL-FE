import { createQueryKeys } from "@/services/react-query/query-key-factory";
import {
  QuizQuestionFilterType,
  QuizQuestionSortType,
} from "@/app/[language]/courses/[course_id]/quizzes/[quiz_id]/quiz-question-filter-type";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useGetQuizQuestionsService } from "@/services/api/services/quiz-question";
import { useInfiniteQuery } from "@tanstack/react-query";

export const quizQuestionsQueryKeys = createQueryKeys(["quizQuestions"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: QuizQuestionFilterType | undefined;
        sort?: QuizQuestionSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useQuizQuestionListQuery = ({
  sort,
  filter,
}: {
  filter?: QuizQuestionFilterType | undefined;
  sort?: QuizQuestionSortType | undefined;
} = {}) => {
  const fetch = useGetQuizQuestionsService();

  const fetchQuizQuestions = async ({
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
    queryKey: quizQuestionsQueryKeys.list().sub.by({ sort, filter }).key,
    initialPageParam: 1,
    queryFn: fetchQuizQuestions,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    gcTime: 0,
  });
};
