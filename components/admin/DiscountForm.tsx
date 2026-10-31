"use client";

import { useActionState } from "react";
import { addDiscount } from "@/app/(admin)/admin/discounts/actions";

export default function DiscountForm({ products }: { products: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(addDiscount, {});
  return (
    <form action={action} className="fx-card adm-discount-form">
      <h2>Create a discount code</h2>
      <div className="adm-discount-fields">
        <label className="fx-field">Name<input name="name" required maxLength={80} placeholder="Crew launch gift" /></label>
        <label className="fx-field">Code<input name="code" required minLength={3} maxLength={14} pattern="[A-Za-z0-9]{3,14}" placeholder="CREW100" autoCapitalize="characters" autoComplete="off" /></label>
        <label className="fx-field">Discount (%)<input name="percentage" type="number" required min={1} max={100} step={1} defaultValue={100} /></label>
        <label className="fx-field">Maximum total uses<input name="maxRedemptions" type="number" required min={1} max={1000000} step={1} defaultValue={25} /><small>Across all customers and selected products.</small></label>
        <label className="fx-field">Expires at end of day (UTC)<input name="expiry" type="date" /><small>Optional. Leave empty for no expiry.</small></label>
      </div>
      <fieldset className="adm-discount-products">
        <legend>Applies to</legend>
        {products.map((product) => <label key={product.id}><input type="checkbox" name="products" value={product.id} defaultChecked />{product.name}</label>)}
      </fieldset>
      <p className="fine">The discount applies once per purchase. A 100% code makes the selected order free. Codes become active when created.</p>
      <button className="btn btn-main" type="submit" disabled={pending || !products.length}>{pending ? "Creating…" : "Create & activate code"}</button>
      {state.error && <p role="alert" className="adm-error">{state.error}</p>}
      {state.success && <p role="status" className="adm-discount-success">{state.success}</p>}
    </form>
  );
}
