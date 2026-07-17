import { redirect } from "next/navigation";

// The résumé isn't hosted — visitors connect with Asad instead.
export default function ResumePage() {
  redirect("/contact");
}
