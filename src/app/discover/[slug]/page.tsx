import { redirect } from "next/navigation";

// Permanently redirect discover slug routes to blog
export default function DiscoverSlugPage() {
  redirect("/blog");
}
