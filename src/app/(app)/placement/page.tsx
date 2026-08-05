import { redirect } from "next/navigation";

/** Legacy path — renamed to /diagnosis. */
export default function PlacementRedirectPage() {
  redirect("/diagnosis");
}
