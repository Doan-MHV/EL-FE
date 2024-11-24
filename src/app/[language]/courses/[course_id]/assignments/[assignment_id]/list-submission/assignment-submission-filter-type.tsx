import { Assignment } from "@/services/api/types/assignment";
import { SortEnum } from "@/services/api/types/sort-type";
import { AssignmentSubmission } from "@/services/api/types/assignment-submission";

export type AssignmentSubmissionFilterType = {
  assignments?: Assignment[];
};

export type AssignmentSubmissionSortType = {
  orderBy: keyof AssignmentSubmission;
  order: SortEnum;
};
