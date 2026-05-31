"use client";

import { useRouter } from "next/navigation";
import StudentTimetableComponent from "../components/StudentTimetableComponent";

export default function StudentTimetablePage() {
  const router = useRouter();

  return (
    <StudentTimetableComponent
      layout="page"
      onBack={() => router.push("/student")}
    />
  );
}
