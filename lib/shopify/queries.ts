// apps/web/lib/shopify/queries.ts

/* ---------- PDP / PLP ---------- */

export const PRODUCT_BY_HANDLE = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      createdAt
      updatedAt
      totalInventory
      availableForSale

      featuredImage { url altText width height }
      images(first: 12) {
        edges { node { url altText width height } }
      }

      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }

      variants(first: 50) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            quantityAvailable
            selectedOptions { name value }
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            image { url altText width height }
          }
        }
      }

      # ---- YOY metafields used to drive PDP logic (editions, countdown, inventory bar, etc.)
      metafields(identifiers: [
        { namespace: "yoy", key: "limited_edition" },
        { namespace: "yoy", key: "edition_end_at" },
        { namespace: "yoy", key: "edition_size" },
        { namespace: "yoy", key: "print_theme" },
        { namespace: "yoy", key: "vibe_tagline" },
        { namespace: "yoy", key: "archetype" },
        { namespace: "yoy", key: "drop_tier" },
        { namespace: "yoy", key: "print_status" },
        { namespace: "yoy", key: "show_inventory" },
        { namespace: "yoy", key: "inventory_meter_max" },
        { namespace: "yoy", key: "badge" }
      ]) {
        namespace
        key
        type
        value
      }
    }
  }
`;

export const ALL_PRODUCTS = /* GraphQL */ `
  query AllProducts($first: Int = 24) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          handle
          title
          createdAt
          availableForSale

          featuredImage { url altText width height }

          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }

          # PLP needs a small subset of metafields (badge + edition flag)
          metafields(identifiers: [
            { namespace: "yoy", key: "badge" },
            { namespace: "yoy", key: "limited_edition" }
          ]) {
            namespace
            key
            type
            value
          }
        }
      }
    }
  }
`;

/* ---------- Cart (used by /api/cart/*) ---------- */

export const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product { title featuredImage { url } }
                }
              }
            }
          }
        }
        cost { subtotalAmount { amount currencyCode } }
      }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product { title featuredImage { url } }
                }
              }
            }
          }
        }
        cost { subtotalAmount { amount currencyCode } }
      }
      userErrors { field message }
    }
  }
`;

export const CART_QUERY = /* GraphQL */ `
  query CartQuery($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 50) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product { title featuredImage { url } }
              }
            }
          }
        }
      }
      cost { subtotalAmount { amount currencyCode } }
    }
  }
`;