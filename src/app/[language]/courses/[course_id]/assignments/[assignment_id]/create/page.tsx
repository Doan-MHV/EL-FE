import { Props } from "next/script";
import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import CreateAssignmentMaterial from "@/app/[language]/courses/[course_id]/assignments/[assignment_id]/create/page-content";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(
    params.language,
    "admin-panel-users-create"
  );

  return {
    title: "Create Assignment",
  };
}

export default CreateAssignmentMaterial;
