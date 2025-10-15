// apps/web/pages/index.js
import Head from 'next/head';
import { getProducts, checkoutUrlFor } from '../lib/shopify'; // checkoutUrlFor returns product page URL

// Build at deploy time, refresh every 60s (ISR)
export async function getStaticProps() {
  const products = await getProducts(12); // fetch up to 12
  return { props: { products }, revalidate: 60 };
}

export default function Home({ products }) {
  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <Head>
        <title>YOY Store</title>
        <meta name="description" content="YOY by Years On Years — first layer essentials." />
      </Head>

      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        YOY Store 🚀
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {products.map((p) => {
          const price = p?.priceRange?.minVariantPrice?.amount;
          const currency = p?.priceRange?.minVariantPrice?.currencyCode;
          const img = p?.featuredImage?.url || '';
          const alt = p?.featuredImage?.altText || p?.title || 'Product image';

          return (
            <article
              key={p.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: '1rem',
              }}
            >
              {img ? (
                <img
                  src={img}
                  alt={alt}
                  width={400}
                  height={400}
                  style={{
                    width: '100%',
                    height: 260,
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                  loading="lazy"
                />
              ) : null}

              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>
                {p.title}
              </h2>

              <p style={{ color: '#374151', marginBottom: 12 }}>
                {price} {currency}
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                {/* Direct to checkout (server API builds a cart) */}
                <a
                  href={`/api/checkout?handle=${encodeURIComponent(p.handle)}`}
                  style={{
                    display: 'inline-block',
                    background: 'black',
                    color: 'white',
                    padding: '0.5rem 0.9rem',
                    borderRadius: 8,
                    textDecoration: 'none',
                  }}
                >
                  Buy now
                </a>

                {/* Fallback: public product page (might be password protected) */}
                <a
                  href={checkoutUrlFor(p.handle)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    color: '#2563eb',
                    padding: '0.5rem 0.9rem',
                    borderRadius: 8,
                    textDecoration: 'underline',
                  }}
                >
                  View on Shopify
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}