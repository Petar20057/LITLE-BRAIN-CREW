// A/B tests of copy, headlines and buttons, read by /admin/tests (experiment_results). Shared by the browser and the
// server, so nothing here may be server-only.
//
// How it works (no cookie, no flash, pages stay static):
//   - Every version is in the page: design pages mark each one with data-ab="<test>" data-v="a|b" (design/*.html),
//     React pages render both with <AB> (components/AB.tsx).
//   - abHeadScript() runs in <head> before the first paint: it gives the visitor a sticky version per active test
//     (localStorage "lbc-ab"), sets <html data-ab-<test>="b">, and abCss() hides every other version.
//   - Inactive tests always show "a". components/ABExposure.tsx sends ab_view (place "test:variant") once per visit
//     for each active test on the page; purchases carry the visitor (lib/delivery.ts), so revenue per visitor is known.
//   - QA: ?ab=home-hero:b (comma-separated for several) forces and remembers a version on this browser.
// Judge a test on money per visitor, and not before ~300 visitors per version (web/FUNNEL.md).
// Turn a test on only once its "b" copy is approved: an active test with no "b" in the page just shows "a".

export type Variant = "a" | "b";

type Experiment = {
  /** What is being tested and where, for /admin/tests. */
  label: string;
  active: boolean;
  /** Share of visitors per version, in percent. */
  weights: Record<Variant, number>;
  /** The "b" copy for spots rendered by React (components/funnel). Design pages keep theirs in the HTML. */
  b?: Record<string, string>;
};

export const EXPERIMENTS = {
  "home-hero": {
    label: "Home headline and intro (/)",
    active: false,
    weights: { a: 50, b: 50 },
  },
  "buy-button": {
    label: "Toolkit buy button (home hero, plans, sticky; /pricing; /dopa)",
    active: false,
    weights: { a: 50, b: 50 },
  },
  plans: {
    label: "Plans heading and Reset button (/#plans)",
    active: false,
    weights: { a: 50, b: 50 },
  },
  "checkout-button": {
    label: "Checkout button and trust line (/checkout)",
    active: false,
    weights: { a: 50, b: 50 },
  },
  "decoder-cta": {
    label: "Decoder pop-up button and page close (/)",
    active: false,
    weights: { a: 50, b: 50 },
  },
} satisfies Record<string, Experiment>;

export type ExperimentId = keyof typeof EXPERIMENTS;
export const isExperiment = (s: unknown): s is ExperimentId => typeof s === "string" && Object.hasOwn(EXPERIMENTS, s);

const all = () => Object.entries(EXPERIMENTS) as [ExperimentId, Experiment][];

/** The "b" copy of a React-rendered spot, or undefined while the test has none (then only "a" is rendered). */
export const copyB = (test: ExperimentId, key: string): string | undefined => (EXPERIMENTS[test] as Experiment).b?.[key];

/** CSS that shows one version per test: "a" for inactive tests and visitors without a version, else theirs. */
export function abCss(): string {
  return all()
    .map(([id, e]) => {
      const sel = `[data-ab="${id}"]`;
      if (!e.active) return `${sel}:not([data-v="a"]){display:none!important}`;
      const versions = Object.keys(e.weights) as Variant[];
      return [
        `html:not([data-ab-${id}]) ${sel}:not([data-v="a"]){display:none!important}`,
        ...versions.map((v) => `html[data-ab-${id}="${v}"] ${sel}:not([data-v="${v}"]){display:none!important}`),
      ].join("");
    })
    .join("");
}

/** The inline <head> script: sticky weighted version per active test, ?ab= override, <html data-ab-*> attributes. */
export function abHeadScript(): string {
  const tests = Object.fromEntries(all().filter(([, e]) => e.active).map(([id, e]) => [id, e.weights]));
  if (!Object.keys(tests).length) return "";
  return `(function(){try{var T=${JSON.stringify(tests)},K="lbc-ab",A=JSON.parse(localStorage.getItem(K)||"{}"),O={},q=new URLSearchParams(location.search).get("ab");
if(q)q.split(",").forEach(function(p){var x=p.split(":");O[x[0]]=x[1]});
for(var t in T){var w=T[t],v=O[t]in w?O[t]:A[t]in w?A[t]:null;
if(!v){var r=Math.random()*Object.keys(w).reduce(function(s,k){return s+w[k]},0);for(var k in w){v=k;if((r-=w[k])<0)break}}
A[t]=v;document.documentElement.setAttribute("data-ab-"+t,v)}
localStorage.setItem(K,JSON.stringify(A))}catch(e){}})();`;
}

/** The version this visitor sees of an active test (set by abHeadScript), or null. Browser only. */
export function assignedVariant(test: ExperimentId): Variant | null {
  const v = document.documentElement.getAttribute(`data-ab-${test}`);
  return v === "a" || v === "b" ? v : null;
}
