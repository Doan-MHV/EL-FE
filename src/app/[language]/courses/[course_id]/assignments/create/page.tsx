import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import { Props } from "next/script";
import CreateAssignment from "./page-content";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(
    params.language,
    "admin-panel-users-create"
  );

  return {
    title: "Create Assignment",
  };
}

export default CreateAssignment;
