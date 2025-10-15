// apps/web/pages/api/checkout.js
import { GraphQLClient, gql } from 'graphql-request';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token  = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const endpoint = `https://${domain}/api/2024-07/graphql.json`;

const client = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token': token,
    'Content-Type': 'application/json'
  }
});

const PRODUCT_BY_HANDLE = gql`
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      variants(first: 1) { edges { node { id } } }
    }
  }
`;

const CART_CREATE = gql`
  mutation CartCreate($lines:[CartLineInput!]!) {
    cartCreate(input:{ lines:$lines }) {
      cart { checkoutUrl }
      userErrors { field message }
    }
  }
`;

export default async function handler(req, res) {
  try {
    const handle = String(req.query.handle || '').trim();
    if (!handle) return res.status(400).json({ ok:false, error:'Missing handle' });

    const p = await client.request(PRODUCT_BY_HANDLE, { handle });
    const edge = p?.product?.variants?.edges?.[0];
    if (!edge) return res.status(404).json({ ok:false, error:'Variant not found' });

    const variantId = edge.node.id;
    const r = await client.request(CART_CREATE, {
      lines: [{ merchandiseId: variantId, quantity: 1 }]
    });

    const url = r?.cartCreate?.cart?.checkoutUrl;
    if (!url) return res.status(502).json({ ok:false, error:'No checkoutUrl', details:r?.cartCreate?.userErrors });

    // send user straight to Shopify Checkout
    return res.redirect(302, url);
  } catch (e) {
    return res.status(500).json({ ok:false, error:e.message });
  }
}