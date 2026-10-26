import CancelFlow from "@/components/funnel/CancelFlow";

export const metadata = { title: "Manage your membership · Little Brain Crew" };

export default function Page() {
  return (
    <div className="fx-narrow" style={{ margin: "24px auto 0" }}>
      <CancelFlow />
    </div>
  );
}
