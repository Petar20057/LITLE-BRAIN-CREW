"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { AD_CONSENT_KEY, AD_READY_EVENT, ADS_CONFIGURED, META_PIXEL_ID, TIKTOK_PIXEL_ID, adConsent, adPathAllowed, trackAdPage } from "@/lib/ad-pixels";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};
const liveSite = () => /^(www\.)?littlebraincrew\.com$/.test(location.hostname);

/** No advertising SDK is fetched before opt-in. No email, quiz answers or download tokens are passed to pixels. */
export default function AdPixels({ enabled }: { enabled: boolean }) {
  const path = usePathname();
  const live = useSyncExternalStore(subscribe, liveSite, () => false);
  const stored = useSyncExternalStore(subscribe, adConsent, () => null);
  const [editing, setEditing] = useState(false);
  const active = enabled && live && ADS_CONFIGURED && adPathAllowed(path);

  useEffect(() => {
    if (active && stored === "granted") trackAdPage(path);
  }, [active, path, stored]);

  if (!active) return null;

  function choose(value: "granted" | "denied") {
    try { localStorage.setItem(AD_CONSENT_KEY, value); } catch { return; }
    // A reload also stops any SDK already loaded when someone withdraws consent.
    window.location.reload();
  }
  function ready() {
    trackAdPage(path);
    window.dispatchEvent(new Event(AD_READY_EVENT));
  }

  return (
    <>
      {stored === "granted" && META_PIXEL_ID && <Script id="lbc-meta-pixel" strategy="afterInteractive" onReady={ready}>
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('set','autoConfig',false,'${META_PIXEL_ID}');fbq('init','${META_PIXEL_ID}');`}
      </Script>}
      {stored === "granted" && TIKTOK_PIXEL_ID && <Script id="lbc-tiktok-pixel" strategy="afterInteractive" onReady={ready}>
        {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;var a=d.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load('${TIKTOK_PIXEL_ID}');}(window,document,'ttq');`}
      </Script>}
      {(!stored || editing) ? <section className="ad-consent" aria-label="Advertising cookie choices">
        <h2>Help us understand which ads work</h2>
        <p>With your permission, we use {META_PIXEL_ID && TIKTOK_PIXEL_ID ? "Meta and TikTok" : META_PIXEL_ID ? "Meta" : "TikTok"} pixels to measure visits and purchases from ads. <a href="/privacy">Privacy details</a></p>
        <div>
          <button className="btn" type="button" onClick={() => choose("denied")}>Decline</button>
          <button className="btn" type="button" onClick={() => choose("granted")}>Allow ad cookies</button>
          {editing && <button className="btn" type="button" onClick={() => setEditing(false)}>Close</button>}
        </div>
      </section> : <button className="ad-preferences" type="button" onClick={() => setEditing(true)}>Ad cookie choices</button>}
    </>
  );
}
