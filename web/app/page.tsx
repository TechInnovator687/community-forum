import { redirect } from "next/navigation";
import { DEFAULT_COURSE_ID } from "@/constants";

export default function HomePage() {
  redirect(`/courses/${DEFAULT_COURSE_ID}`);
}
