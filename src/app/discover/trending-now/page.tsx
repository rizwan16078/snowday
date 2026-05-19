import { permanentRedirect } from "next/navigation";

// Permanently redirect discover/trending-now to blog
export default function DiscoverTrendingPage() {
  permanentRedirect("/blog");
}
