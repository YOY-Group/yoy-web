-- idempotent core table
create table if not exists public.shopify_orders (
  id                uuid primary key default gen_random_uuid(),
  shopify_order_id  text not null unique,
  name              text,
  order_number      int,
  currency          text,
  total_price       numeric(12,2),
  financial_status  text,
  fulfillment_status text,
  customer_email    text,
  inserted_at       timestamptz not null default now(),
  updated_row_at    timestamptz not null default now(),
  payload           jsonb
);

-- helpful indexes
create index if not exists idx_shopify_orders_email on public.shopify_orders (customer_email);
create index if not exists idx_shopify_orders_number on public.shopify_orders (order_number);

-- sample seed row (safe-upsert on unique shopify_order_id)
insert into public.shopify_orders (
  shopify_order_id, name, order_number, currency, total_price,
  financial_status, fulfillment_status, customer_email, payload
) values (
  'test-1001', '#1001', 1001, 'GBP', 28.00,
  'paid', 'fulfilled', 'seed@example.com',
  jsonb_build_object('note','seed row')
)
on conflict (shopify_order_id) do update
set updated_row_at = now();
