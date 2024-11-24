import type { Metadata } from "next";
import CreateCourse from "./page-content";
import { getServerTranslation } from "@/services/i18n";
import { Props } from "next/script";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(
    params.language,
    "admin-panel-users-create"
  );

  return {
    title: "Create Course",
  };
}

export default CreateCourse;
