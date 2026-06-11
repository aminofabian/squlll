"use client";

import ExamsMarksComponent from "../components/ExamsMarksComponent";
import { useParams } from "next/navigation";

export default function TeacherExamsPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  return <ExamsMarksComponent subdomain={subdomain} />;
}
