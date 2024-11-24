import { createQueryKeys } from "@/services/react-query/query-key-factory";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  AssignmentMaterialFilterType,
  AssignmentMaterialSortType,
} from "@/app/[language]/courses/[course_id]/assignments/[assignment_id]/assignment-material-filter-type";
import { useGetAssignmentMaterialsService } from "@/services/api/services/assignment-material";

export const assignmentMaterialsQueryKeys = createQueryKeys(
  ["assignmentMaterials"],
  {
    list: () => ({
      key: [],
      sub: {
        by: ({
          sort,
          filter,
        }: {
          filter: AssignmentMaterialFilterType | undefined;
          sort?: AssignmentMaterialSortType | undefined;
        }) => ({
          key: [sort, filter],
        }),
      },
    }),
  }
);

export const useAssignmentMaterialListQuery = ({
  sort,
  filter,
}: {
  filter?: AssignmentMaterialFilterType | undefined;
  sort?: AssignmentMaterialSortType | undefined;
} = {}) => {
  const fetch = useGetAssignmentMaterialsService();

  const fetchAssignmentMaterials = async ({
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
    queryKey: assignmentMaterialsQueryKeys.list().sub.by({ sort, filter }).key,
    initialPageParam: 1,
    queryFn: fetchAssignmentMaterials,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    gcTime: 0,
  });
};
