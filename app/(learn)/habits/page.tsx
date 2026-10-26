import { HubRoute, hubMeta } from "@/lib/learn-routes";

// Full page loads between pages (plain links), so no client navigation for Next's instant check to validate.
export const instant = false;

export const metadata = hubMeta("habits");

export default function Page() {
  return <HubRoute section="habits" />;
}
