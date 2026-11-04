"use client";

import { useEffect, useState } from "react";

// The phone-only buy bar for a React sales page (the design pages get theirs from site.js, #sticky). It slides in once the
// visitor has scrolled past the first screen and hides while any element in `hide` (by id) is on screen, e.g. the form
// itself or the footer. Same look as the design pages' bar (.sticky in site.css, shown only up to 760 px wide).
export default function StickyBuy({ href, label, hide }: { href: string; label: string; hide: string[] }) {
  const [show, setShow] = useState(false);
  const key = hide.join(",");
  useEffect(() => {
    document.body.classList.add("has-sticky");
    const visible = new Map<Element, boolean>();
    const update = () => setShow(window.scrollY > window.innerHeight * 0.85 && ![...visible.values()].some(Boolean));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => visible.set(e.target, e.isIntersecting));
      update();
    });
    key.split(",").map((id) => document.getElementById(id)).forEach((el) => el && io.observe(el));
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
      document.body.classList.remove("has-sticky");
    };
  }, [key]);
  return (
    <div className={`sticky${show ? " show" : ""}`}>
      <a href={href} data-track="cta_click" data-place="personal-plan-sticky">{label}</a>
    </div>
  );
}
