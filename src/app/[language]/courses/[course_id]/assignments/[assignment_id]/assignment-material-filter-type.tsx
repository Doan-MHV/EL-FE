import { Assignment } from "@/services/api/types/assignment";
import { SortEnum } from "@/services/api/types/sort-type";
import { AssignmentMaterial } from "@/services/api/types/assignment-material";

export type AssignmentMaterialFilterType = {
  assignments?: Assignment[];
};

export type AssignmentMaterialSortType = {
  orderBy: keyof AssignmentMaterial;
  order: SortEnum;
};
