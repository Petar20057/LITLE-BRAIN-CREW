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
// The copy (2026-11-04, the Hormozi pass): the done-for-you promise, what a plan looks like (a shortened example, because
// there are no reviews and no refunds), the honest "why not just the $19 Toolkit", who it's for, the questions, the form.
// Rules: no promise about the child, no guarantee, no invented reference prices, no fake scarcity.

export const instant = false;

const PRICE = usd(ITEMS.personalPlan.price);
const TOOLKIT = usd(ITEMS.guide.price);
const DAYS = `${PLAN_REPLY_DAYS} working days`;
const DESCRIPTION = `A plan written for your family for ${PRICE}: tell us about your kid and the moment that keeps going wrong, and within ${DAYS} a person writes you the crew member behind it, one small move for each evening and the exact words for your kid’s age.`;

export const metadata = simpleMetadata({ metaTitle: "The Personal Plan: Written for Your Family", description: DESCRIPTION, path: "/personal-plan" });

export default function Page() {
  const open = creemConfigured && Boolean(productIdFor(ITEMS.personalPlan.id));
  return (
    <LearnShell>
      <JsonLd data={[webPageLd({ path: "/personal-plan", name: "The Personal plan", description: DESCRIPTION }), breadcrumbLd([{ name: "Home", path: "/" }, { name: "The Personal plan", path: "/personal-plan" }])]} />

      {/* 1 · The offer */}
      <section className="sec s-plain offer-hero" data-c="var(--toci)">
        <div className="wrap">
          <div className="center-head">
            <span className="kick">the personal plan · written for one family · {PRICE}, once</span>
            <h1 className="serif-h">Stop guessing what to try next.<br />Tell us the one moment, and we write the plan for your house.</h1>
            <p className="lede">Not a book for every family. A plan for yours: your kid’s age, your routine, your week. Within {DAYS} a person on our team writes what’s going on, one small move for each evening, and the exact words to say, from the same science as the Toolkit. Then you reply with what happened, and we answer.</p>
            <div className="offer-buy">
              <span className="big">{PRICE}</span>
              <span className="per">one payment · ten minutes of answers from you · your plan by email within {DAYS}</span>
              <a className="btn btn-main btn-lg" href="#plan-form">Start with the form ↓</a>
              <span className="fine">You pay after the form, on Creem’s secure checkout. No subscription. Not medical advice.</span>
            </div>
            <div className="trust-row" style={{ justifyContent: "center" }}>
              <span><svg aria-hidden="true"><use href="#i-check" /></svg>Written by a person, not generated</span>
              <span><svg aria-hidden="true"><use href="#i-check" /></svg>Ages 4–17</span>
              <span><svg aria-hidden="true"><use href="#i-check" /></svg>A reply when you’re stuck</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · What you're really buying */}
      <section className="sec s-white" id="what" data-c="var(--endo)">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <div className="center-head"><span className="kick">what you’re really buying</span><h2>Someone thinks it through, so you don’t have to at 9:30 p.m.</h2>
            <p className="lede">You’ve read the tips. You’ve tried the timer and the calm voice. What you haven’t had is a plan that knows your kid is seven, that bedtime is 7:45 on school nights, that Tuesday is swimming, and that the tablet is the problem and not the TV.</p></div>
          <ul className="value-stack" data-reveal>
            <li><b>The crew member behind the moment</b><span>Which messenger, hormone or brain part is driving it, in plain words you can say to your kid. So the moment stops feeling like a character flaw.</span></li>
            <li><b>One small move for each evening of the week</b><span>Written for your routine, not a generic list. The first move is for tonight. So you never again wonder what to do while it’s happening.</span></li>
            <li><b>The exact words for your kid’s age</b><span>Before, during and after the moment, in the words a 4-year-old or a 15-year-old actually hears. So you don’t improvise under pressure.</span></li>
            <li><b>What to expect, week by week</b><span>Which small changes come first, what a bad night means, and when to adjust. So one bad Thursday doesn’t end the plan.</span></li>
            <li><b>A reply when you’re stuck</b><span>Once you have the plan, reply to the email with what happened and a person answers. So you’re not alone with it.</span></li>
          </ul>
          <p style={{ textAlign: "center", marginTop: "var(--s4)" }}><a className="btn btn-main btn-lg" href="#plan-form">Start with the form ↓</a></p>
        </div>
      </section>

      {/* 3 · What a plan looks like: a shortened example, so the format is visible before paying */}
      <section className="sec s-plain" id="example" data-c="var(--dopa)">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <div className="center-head"><span className="kick">what a plan looks like</span><h2>Written for one family. Shortened here.</h2>
            <p className="lede">An example, for a 7-year-old whose screen time ends in tears most school nights. Yours is written from your answers: your routine, your week, your kid’s age.</p></div>
          <div className="surface pp-example">
            <p className="meta">Example plan · a 7-year-old · tears when the tablet goes off · school nights</p>
            <h3>What’s going on</h3>
            <p>Games and videos hand out surprises every few seconds, and Dopa (dopamine, the wanting-and-learning helper) responds most to better-than-expected rewards. When the screen goes off, that stream stops all at once. To a 7-year-old whose brakes (Fronti) are still being built, it feels like a real loss. The tears are a normal reaction to a hard stop, not a sign that something is wrong with him. The villain here is Lupi: autoplay and a session with no ending.</p>
            <h3>Tonight: the move</h3>
            <ol className="tonight">
              <li>Before the tablet goes on, agree the end together and pick what comes next (the Lego bin, setting the table).</li>
              <li>At 5 minutes: go close, eye level, first warning. At 1 minute: second warning, fewer words.</li>
              <li>Stop, and go straight to the thing you picked. No empty gap.</li>
              <li>Cheer the stop, even if there were tears: “You turned it off. That was hard and you did it.”</li>
            </ol>
            <h3>Say it, for a 7-year-old</h3>
            <ul className="pp-say">
              <li>“5 more minutes, then the tablet sleeps.”</li>
              <li>“1 more minute. Find a place to save.”</li>
              <li>“I know you want more. The answer is still no. You can play again tomorrow.”</li>
            </ul>
            <h3>This week</h3>
            <p>Monday and Tuesday: just the two warnings and the next thing ready. Wednesday: autoplay off on every app, and the session ends after an episode, never mid-episode. Thursday and Friday: the same, and you keep the stop time the same every night. Weekend: screens end before dinner, not before bed.</p>
            <h3>If it’s not working</h3>
            <p>Tears at the stop for three nights running usually mean the ending is still a surprise: check that the warnings come the same way every time, and shorten the session rather than skipping the warnings. If the stop is still a storm after two weeks, or the tears spread to other endings all day, reply to the plan and we look at it again. If distress around screens feels extreme or out of control for months, that’s a conversation for your pediatrician, not a plan.</p>
            <p className="fine">Shortened: the plan a parent gets also covers the morning after, the words for the other adult at home, and what to watch for in the first two weeks. Educational guidance about habits and words, not medical advice.</p>
          </div>
        </div>
      </section>

      {/* 4 · Why not just the Toolkit? The honest answer, and the downsell */}
      <section className="sec s-white" id="why-not" data-c="var(--sero)">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <div className="center-head"><span className="kick">be honest with yourself</span><h2>Why not just the {TOOLKIT} Toolkit?</h2>
            <p className="lede">Maybe you should. The Toolkit has the same science for every family: the 12 moments with the exact words, the 30-day plan, the Science Edition, all 214 crew members. If one page and one evening are enough for your house, start there and keep your {PRICE}.</p></div>
          <div className="two-way" data-reveal>
            <div className="surface" style={{ "--c": "var(--dopa)" } as React.CSSProperties}>
              <span className="kick">the toolkit · {TOOLKIT}</span>
              <h3>You read the page and run the plan yourself.</h3>
              <p>Everything in one download, tonight. Best when you can see your moment on page 4 and you have the energy to adapt the words to your kid.</p>
              <a className="btn" href="/toolkit">See inside the Toolkit →</a>
            </div>
            <div className="surface" style={{ "--c": "var(--toci)" } as React.CSSProperties}>
              <span className="kick">the personal plan · {PRICE}</span>
              <h3>A person adapts it to your house, and answers when it doesn’t go to plan.</h3>
              <p>Best when the moment is specific and stubborn, you’ve already tried the obvious things, and you want it done for you. If you have the Toolkit, say so in the form: the plan builds on it instead of repeating it.</p>
              <a className="btn btn-main" href="#plan-form">Start with the form ↓</a>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · How it works */}
      <section className="sec s-plain" id="how" data-c="var(--endo)">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <div className="center-head"><span className="kick">how it works</span><h2>Ten minutes from you. {DAYS} from us.</h2></div>
          <ol className="ty-next">
            <li><b>You fill in the form</b> (about 10 minutes): your kid’s age, the moment, when it happens, what you’ve tried and what a good week would look like. No child’s name, no medical details. The more concrete, the better the plan.</li>
            <li><b>You pay {PRICE}</b> on Creem’s secure checkout: card, Apple Pay or Google Pay. Work starts the moment it goes through.</li>
            <li><b>Your plan lands in your inbox within {DAYS}</b>, from hello@littlebraincrew.com. You try it. You reply with what happened. We answer.</li>
          </ol>
        </div>
      </section>

      {/* 6 · For / not for */}
      <section className="sec s-white" id="fit" data-c="var(--sero)">
        <div className="wrap">
          <div className="fit">
            <div className="surface fit-yes"><h3>This is for you if…</h3>
              <ul><li>One moment keeps going wrong, and you can describe it</li><li>You’ve tried the obvious things and want someone to think it through for your family</li><li>You have the Toolkit and want it applied to your house</li><li>You’d rather answer ten questions than read four books</li></ul></div>
            <div className="surface fit-no"><h3>It’s not for you if…</h3>
              <ul><li>You’re looking for a diagnosis, therapy or medical care. We don’t do any of those.</li><li>Something about your child’s health worries you. Call your pediatrician first.</li><li>Your child talks about hurting themselves: call or text 988 today, don’t fill in a form.</li><li>You want a promise. We make none about your child.</li></ul></div>
          </div>
        </div>
      </section>

      {/* 7 · Questions */}
      <section className="sec s-plain" id="faq" data-c="var(--teo)">
        <div className="wrap">
          <h2 style={{ marginBottom: 24 }}>Questions before you start</h2>
          <div className="faq-list">
            <details><summary>Who writes it?</summary><p>A person on the Little Brain Crew team, from your answers and the same science and sources behind the Toolkit. Not a doctor, not a therapist, and not an automated reply. It’s educational guidance about habits and words.</p></details>
            <details><summary>Why {PRICE} when the Toolkit is {TOOLKIT}?</summary><p>Because the Toolkit is the same code for everyone, and the plan is the code for your routine, your week and your kid’s age, written by hand, with a reply when you’re stuck. Hours of one person’s attention on your family. If the Toolkit is enough, buy the Toolkit; we say so above.</p></details>
            <details><summary>What if my moment isn’t on the list?</summary><p>Pick “Something else” in the form and describe it in a sentence or two. The 12 moments on the list are the most common ones; the plan is written for whatever is happening at your house.</p></details>
            <details><summary>I have two kids. Can one plan cover both?</summary><p>One plan is for one kid and one moment, so the words fit the age. If the same moment plays out with two kids, say so in the form and the plan covers how to run it with both in the room.</p></details>
            <details><summary>I already have the Toolkit. Is this different?</summary><p>Yes. The Toolkit explains the moments for every family; the plan applies them to yours. Tick what you have in the form, and the plan builds on it instead of repeating it.</p></details>
            <details><summary>How long until I have it?</summary><p>Within {DAYS} of paying, by email. The first move in it is for the evening you read it.</p></details>
            <details><summary>Can I ask questions once I have it?</summary><p>Yes. Reply to the email your plan came in with what happened, and we answer.</p></details>
            <details><summary>Can I get a refund?</summary><p>Work on your plan starts the moment you pay, so all sales are final (see our <a href="/terms">Terms</a>). That’s why a shortened example is on this page: you can see what you’re getting before you decide.</p></details>
            <details><summary>Is this medical advice or therapy?</summary><p>No. It’s educational guidance about everyday habits and the words to use, built on published research and pediatric guidelines. We don’t diagnose, treat or promise results. If something about your child worries you, your pediatrician is the right first call.</p></details>
          </div>
        </div>
      </section>

      {/* 8 · The form */}
      <section className="sec s-white" id="plan-form-section" data-c="var(--toci)">
        <div className="wrap fx-narrow" style={{ margin: "0 auto" }}>
          <PersonalPlanForm open={open} />
        </div>
      </section>
    </LearnShell>
  );
}
