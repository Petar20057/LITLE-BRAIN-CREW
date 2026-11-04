import DesignPage from "@/components/DesignPage";
import { pageMetadata } from "@/lib/design";
import { homeLockedCrewHtml } from "@/lib/home-locked-crew";

export const metadata = pageMetadata("index");

export default function Home() {
  return <DesignPage name="index" slots={{ "locked-crew": homeLockedCrewHtml() }} />;
}
