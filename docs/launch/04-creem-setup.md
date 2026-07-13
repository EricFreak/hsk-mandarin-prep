# Creem MoR setup (mainland-friendly payments)

Use **Creem** as Merchant of Record when you cannot open a Stripe account (e.g. mainland China, domestic bank only). Creem collects USD from global customers, handles tax, and pays out to your verified bank account.

## 1. Create a Creem account

1. Sign up at [creem.io](https://creem.io)
2. Complete **KYC** (passport + bank details; name must match your bank account)
3. Stay in **Test mode** until checkout works end-to-end

## 2. Create subscription products

In Creem Dashboard → **Products**:

| Product | Billing | Price |
|---------|---------|-------|
| HSK Mandarin Prep Pro — Monthly | Recurring / monthly | $9.99 USD |
| HSK Mandarin Prep Pro — Yearly | Recurring / yearly | $69 USD |

Copy each **Product ID** (`prod_…`) into `.env.local`:

```bash
CREEM_PRODUCT_PRO_MONTHLY=prod_...
CREEM_PRODUCT_PRO_YEARLY=prod_...
CREEM_API_KEY=...          # Developers → API keys
CREEM_TEST_MODE=true       # false in production
PAYMENT_PROVIDER=creem
```

## 3. Webhook

Register in Creem → **Developers → Webhooks**:

| Environment | URL |
|-------------|-----|
| Local (ngrok) | `https://<tunnel>/api/webhooks/creem` |
| Production | `https://hsk-mandarin-prep.vercel.app/api/webhooks/creem` |

Subscribe to:

- `checkout.completed`
- `subscription.paid` (primary — grant Pro)
- `subscription.canceled` / `subscription.expired` (revoke Pro)

Copy **Webhook secret** → `CREEM_WEBHOOK_SECRET`

Also set on Vercel:

- `SUPABASE_SERVICE_ROLE_KEY` (webhook updates `profiles.plan`)
- All `CREEM_*` variables above

## 4. Test the business loop

1. Register a **new free account** (not founder Pro)
2. Hit practice limit or open `/pricing`
3. Click **Upgrade to Pro** → Creem hosted checkout
4. Pay with Creem test card (see Creem docs)
5. Confirm redirect to `/dashboard?upgraded=1`
6. Confirm Supabase `profiles.plan = 'pro'`
7. Cancel subscription in Creem → confirm `plan` returns to `free`

## 5. Go live

1. Switch Creem to **Live mode**, recreate products, update env vars
2. Set `CREEM_TEST_MODE=false`
3. Redeploy Vercel

## App endpoints

| Route | Purpose |
|-------|---------|
| `POST /api/checkout` | Creates Creem (or Stripe) checkout URL |
| `POST /api/webhooks/creem` | Syncs subscription → Supabase |

Legacy Stripe routes (`/api/stripe/*`) still work if `PAYMENT_PROVIDER=stripe`.

## Stripe vs Creem

| | Creem | Stripe |
|---|-------|--------|
| Mainland individual | ✅ (via MoR + KYC) | ❌ |
| Fees | ~3.9% + $0.40 | ~2.9% + $0.30 |
| Tax/VAT | Handled by Creem | You handle |
| Payout | To verified bank (incl. CN) | Needs overseas bank |

See also: `README.md` for full env list.
