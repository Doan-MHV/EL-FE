import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import MyAssignmentSubmissionDetails from "./page-content";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "Lectures");

  return {
    title: "My Submission",
  };
}

export default MyAssignmentSubmissionDetails;
