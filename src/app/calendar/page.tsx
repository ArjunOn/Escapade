import { redirect } from "next/navigation";

// /calendar redirects to /planner (consolidated)
export default function CalendarPage() {
  redirect("/planner");
}
