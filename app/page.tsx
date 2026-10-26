import DesignPage from "@/components/DesignPage";
import { pageMetadata } from "@/lib/design";

export const metadata = pageMetadata("index");

export default function Home() {
  return <DesignPage name="index" />;
}
