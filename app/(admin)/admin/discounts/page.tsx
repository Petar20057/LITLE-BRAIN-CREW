import { AdminHeader } from "@/components/admin/Admin";
import DiscountForm from "@/components/admin/DiscountForm";
import { requireAdmin } from "@/lib/admin";
import { CREEM_LIVE, CreemError, discountsConfigured, discountProducts } from "@/lib/creem";
import { discountStatus, listDiscounts } from "@/lib/discounts";

export const metadata = { title: "Discount codes · Admin" };
export const instant = false;

export default async function Page({ searchParams }: PageProps<"/admin/discounts">) {
  const { email } = await requireAdmin();
  const rawPage = Number((await searchParams).page ?? 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const products = discountProducts();
  let discounts;
  let failed = false;
  let needsPermissions = false;
  if (discountsConfigured) {
    try { discounts = await listDiscounts(page); }
    catch (error) { console.error("[admin discounts] list failed", error); failed = true; needsPermissions = error instanceof CreemError && error.status === 403; }
  }
  return (
    <div className="adm-page">
      <AdminHeader tab="/admin/discounts" email={email} />
      <h1>Discount codes</h1>
      <p className="fx-sub">Create percentage discounts and set a total usage limit. Customers enter their code at the secure payment checkout.</p>
      <p className="fine">{CREEM_LIVE ? "Live store: codes work on real orders." : "Test store: codes only work on test orders."} Usage counts completed orders, not visits to checkout.</p>
      {!discountsConfigured ? <p className="adm-error">Connect payments to create and view discount codes.</p> : <>
        {!needsPermissions && <DiscountForm products={products} />}
        {failed ? <p className="adm-error" role="alert">{needsPermissions ? "The payment key needs discounts:read and discounts:write permissions. Connect a restricted discounts key to enable this page." : <>Couldn’t load codes. <a href="/admin/discounts">Try again</a>.</>}</p> : <>
          <div className="table-wrap">
            <table className="learn-table adm-list">
              <caption>Discount codes · {discounts?.pagination.total_records ?? 0} total · <a href={`/admin/discounts?page=${page}`}>Refresh usage</a></caption>
              <thead><tr><th scope="col">Code</th><th scope="col">Discount</th><th scope="col">Used / limit</th><th scope="col">Status</th><th scope="col">Products</th><th scope="col">Expires (UTC)</th></tr></thead>
              <tbody>
                {!discounts?.items.length && <tr><td colSpan={6}>No discount codes yet.</td></tr>}
                {discounts?.items.map((discount) => <tr key={discount.id}>
                  <th scope="row"><code>{discount.code}</code><small className="adm-discount-name">{discount.name}</small></th>
                  <td>{discount.type === "percentage" ? `${discount.percentage}%` : `${discount.amount! / 100} ${discount.currency}`}</td>
                  <td>{discount.redeem_count ?? 0} / {discount.max_redemptions ?? "Unlimited"}</td>
                  <td>{discountStatus(discount)}</td>
                  <td>{discount.applies_to_products?.length ? discount.applies_to_products.map((id) => products.find((p) => p.id === id)?.name ?? id).join(", ") : "All products"}</td>
                  <td>{discount.expiry_date ? new Date(discount.expiry_date).toLocaleDateString("en-GB", { timeZone: "UTC" }) : "No expiry"}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <nav aria-label="Discount pages" className="adm-discount-pages">
            {discounts?.pagination.prev_page && <a href={`/admin/discounts?page=${discounts.pagination.prev_page}`}>← Previous</a>}
            {discounts?.pagination.next_page && <a href={`/admin/discounts?page=${discounts.pagination.next_page}`}>Next →</a>}
          </nav>
        </>}
      </>}
    </div>
  );
}
