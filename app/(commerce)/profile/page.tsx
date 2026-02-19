import { redirect } from "next/navigation";

/** Redirect legacy /profile to /account/profile */
export default function ProfileRedirect() {
    redirect("/account/profile");
}
