import { isSessionId } from "@/lib/quiz-track";
import { unsubscribeAction } from "../consent-actions";

// The unsubscribe link in our emails. The button removes the address from every list (lib/consent.ts);
// mail apps' own "unsubscribe" button posts to /api/unsubscribe instead.
export const metadata = { title: "Unsubscribe · Little Brain Crew" };
// Reads the link's token on every request.
export const instant = false;

const DONE: Record<string, { title: string; text: string }> = {
  done: { title: "You’re unsubscribed", text: "We won’t send you tips or news anymore. Emails about something you bought still reach you." },
  already: { title: "Already unsubscribed", text: "This address isn’t on any of our lists." },
  unknown: { title: "This link doesn’t work", text: "It may be cut off or mistyped. Write to hello@littlebraincrew.com and we’ll take you off by hand." },
};

export default async function Page({ searchParams }: PageProps<"/unsubscribe">) {
  const { t, done } = await searchParams;
  const shown = typeof done === "string" ? DONE[done] : !isSessionId(t) ? DONE.unknown : null;

  return (
    <div className="fx-card fx-narrow" style={{ margin: "24px auto 0" }}>
      {shown ? (
        <>
          <h1>{shown.title}</h1>
          <p className="fx-sub">{shown.text}</p>
          <a className="btn" href="/">Back to the crew</a>
        </>
      ) : (
        <form action={unsubscribeAction}>
          <h1>Unsubscribe?</h1>
          <p className="fx-sub">You’ll stop getting crew tips and news. Emails about something you bought still reach you.</p>
          <input type="hidden" name="t" value={t as string} />
          <button className="btn btn-main" type="submit">Unsubscribe me</button>
        </form>
      )}
    </div>
  );
}
