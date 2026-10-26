import AffiliatePanel from "@/components/funnel/AffiliatePanel";

export const metadata = { title: "Share the crew · Little Brain Crew" };

// Members-only. The affiliate program itself runs on Creem; this page explains it and asks for the invite.
export default function Page() {
  return (
    <div className="fx-narrow" style={{ margin: "24px auto 0" }}>
      <AffiliatePanel />
    </div>
  );
}
