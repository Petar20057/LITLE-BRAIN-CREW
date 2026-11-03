import PersonalPlanThanks from "@/components/funnel/PersonalPlanThanks";
import LearnShell from "@/components/learn/LearnShell";
import { simpleMetadata } from "@/lib/seo";

// Where Creem sends the parent after paying for a Personal plan (app/api/personal-plan successUrl). Private: noindex here
// and in app/robots.ts.
export const instant = false;

export const metadata = simpleMetadata({ metaTitle: "Thank You: Your Personal Plan Is on Its Way", description: "We have your answers. Your plan arrives by email within a few working days.", path: "/personal-plan/thanks", noindex: true });

export default function Page() {
  return (
    <LearnShell>
      <section className="sec s-plain" data-c="var(--toci)">
        <div className="wrap fx-narrow" style={{ margin: "0 auto" }}>
          <PersonalPlanThanks />
        </div>
      </section>
    </LearnShell>
  );
}
