import PersonalPlanForm from "@/components/funnel/PersonalPlanForm";
import JsonLd from "@/components/learn/JsonLd";
import LearnShell from "@/components/learn/LearnShell";
import { creemConfigured, productIdFor } from "@/lib/creem";
import { ITEMS, usd } from "@/lib/funnel";
import { breadcrumbLd, webPageLd } from "@/lib/jsonld";
import { PLAN_REPLY_DAYS } from "@/lib/personal-plan-form";
import { simpleMetadata } from "@/lib/seo";

// The Personal plan ($199): the sales page and the intake form. A React page (not design/) because the form must talk to
// /api/personal-plan and then leave for Creem; LearnShell gives it the site's header and footer. The form is closed until
// the Creem product id is filled in (lib/creem-products.json), so the page can be deployed before the product exists.

export const instant = false;

const PRICE = usd(ITEMS.personalPlan.price);
const DAYS = `${PLAN_REPLY_DAYS} working days`;
const DESCRIPTION = `A plan written for your family for ${PRICE}: tell us about your kid and the moment that keeps going wrong, and within ${DAYS} you get the crew member behind it, one small move for each evening and the exact words for your kid’s age.`;

export const metadata = simpleMetadata({ metaTitle: "The Personal Plan: Written for Your Family", description: DESCRIPTION, path: "/personal-plan" });

export default function Page() {
  const open = creemConfigured && Boolean(productIdFor(ITEMS.personalPlan.id));
  return (
    <LearnShell>
      <JsonLd data={[webPageLd({ path: "/personal-plan", name: "The Personal plan", description: DESCRIPTION }), breadcrumbLd([{ name: "Home", path: "/" }, { name: "The Personal plan", path: "/personal-plan" }])]} />
      <section className="sec s-plain offer-hero" data-c="var(--toci)">
        <div className="wrap">
          <div className="center-head">
            <span className="kick">the personal plan</span>
            <h1 className="serif-h">A plan written for your family.</h1>
            <p className="lede">Tell us about your kid and the one moment that keeps going wrong. We write back with the crew member behind it, one small move for each evening and the exact words for your kid’s age. Not a book to read: a plan for your house, your week, your kid.</p>
            <div className="offer-buy">
              <span className="big">{PRICE}</span>
              <span className="per">one payment · your plan by email within {DAYS}</span>
              <a className="btn btn-main btn-lg" href="#plan-form">Start with the form ↓</a>
              <span className="fine">About 10 minutes. You pay after the form, on Creem’s secure checkout.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec s-white" data-c="var(--endo)">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <div className="center-head"><span className="kick">how it works</span><h2>Three steps. One of them is ours.</h2></div>
          <ol className="ty-next">
            <li><b>You fill in the form</b> (about 10 minutes): your kid’s age, the moment, when it happens, what you’ve tried and what a good week would look like. No child’s name, no medical details.</li>
            <li><b>You pay {PRICE}</b> on Creem’s secure checkout: card, Apple Pay or Google Pay. We start working the moment it goes through.</li>
            <li><b>Your plan lands in your inbox within {DAYS}</b>, from hello@littlebraincrew.com. Questions once you have it? Reply to that email.</li>
          </ol>
          <div className="center-head" style={{ marginTop: "var(--s5)" }}><span className="kick">what you get</span><h2>Your evenings, decoded.</h2></div>
          <ul className="value-stack">
            <li><b>The crew member behind the moment</b><span>Which messenger, hormone or brain part is driving it, in plain words you can say to your kid.</span></li>
            <li><b>One small move for each evening</b><span>Written for your routine and your week, not a generic list. The first move is for tonight.</span></li>
            <li><b>The exact words for your kid’s age</b><span>What to say before, during and after the moment, in the words a 4-year-old or a 15-year-old actually hears.</span></li>
            <li><b>What to expect, week by week</b><span>Which small changes come first, what a bad night means, and when to adjust.</span></li>
          </ul>
          <p className="fine" style={{ marginTop: "var(--s3)" }}>Educational guidance about everyday habits and words, not medical advice, therapy or a diagnosis. If something about your child’s health worries you, call your pediatrician first.</p>
        </div>
      </section>

      <section className="sec s-plain" id="plan-form-section" data-c="var(--toci)">
        <div className="wrap fx-narrow" style={{ margin: "0 auto" }}>
          <PersonalPlanForm open={open} />
        </div>
      </section>
    </LearnShell>
  );
}
