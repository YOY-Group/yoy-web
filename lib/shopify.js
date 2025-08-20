import { GraphQLClient, gql } from 'graphql-request';

function makeClient() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token  = process.env.SHOPIFY_STOREFRONT_API_TOKEN;

  if (!domain || !token) {
    throw new Error('Missing Shopify env: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_API_TOKEN');
  }

  const endpoint = `https://${domain}/api/2024-07/graphql.json`;
  return new GraphQLClient(endpoint, {
    headers: {
      'X-Shopify-Storefront-Access-Token': token,
      'Content-Type': 'application/json',
    },
  });
}

export const PRODUCTS_QUERY = gql`
  query Products($first: Int = 12) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          featuredImage { url altText width height }
          priceRange { minVariantPrice { amount currencyCode } }
          variants(first: 1) { edges { node { id } } }
          onlineStoreUrl
        }
      }
    }
  }
`;

export async function getProducts(limit = 12) {
  const client = makeClient();
  const data = await client.request(PRODUCTS_QUERY, { first: limit });
  return data.products.edges.map(e => e.node);
}

export function checkoutUrlFor(handle) {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new Error('Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN');
  return `https://${domain}/products/${handle}`;
}