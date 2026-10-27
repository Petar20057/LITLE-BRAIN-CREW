import { isSessionId } from "@/lib/quiz-track";
import { confirmAction } from "../consent-actions";

// Double opt-in: the link in a confirmation email lands here, and only the button confirms (lib/consent.ts).
export const metadata = { title: "Confirm your email · Little Brain Crew" };
// Reads the link's token on every request.
export const instant = false;

const DONE: Record<string, { title: string; text: string }> = {
  done: { title: "You’re confirmed", text: "Thanks. We’ll send what you asked for, and nothing else. Every email has an unsubscribe link." },
  already: { title: "Already confirmed", text: "This address was confirmed before. Nothing more to do." },
  unknown: { title: "This link doesn’t work", text: "It may be cut off or mistyped. Copy the whole link from the email, or sign up again on the site." },
};

export default async function Page({ searchParams }: PageProps<"/confirm">) {
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
        <form action={confirmAction}>
          <h1>Confirm your email</h1>
          <p className="fx-sub">One tap, so we know it’s really you.</p>
          <input type="hidden" name="t" value={t as string} />
          <button className="btn btn-main" type="submit">Yes, that’s me</button>
        </form>
      )}
    </div>
  );
}
