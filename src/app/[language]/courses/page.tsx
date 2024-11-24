import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import Courses from "./page-content";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(
    params.language,
    "admin-panel-users"
  );

  return {
    title: "Courses",
  };
}

export default Courses;
