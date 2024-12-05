import { Assignment } from "@/services/api/types/assignment";
import { SortEnum } from "@/services/api/types/sort-type";
import { AssignmentSubmission } from "@/services/api/types/assignment-submission";
import { User } from "@/services/api/types/user";

export type AssignmentSubmissionFilterType = {
  assignments?: Assignment[];
  students?: User[];
};

export type AssignmentSubmissionSortType = {
  orderBy: keyof AssignmentSubmission;
  order: SortEnum;
};
