import { getProducts, checkoutUrlFor } from '../lib/shopify';

export async function getServerSideProps() {
  const products = await getProducts();
  return { props: { products } };
}

export default function Home({ products }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>YOY Store 🚀</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id} style={{ marginBottom: '1rem' }}>
            <strong>{p.title}</strong> – {p.priceRange.minVariantPrice.amount}{' '}
            {p.priceRange.minVariantPrice.currencyCode}
            <br />
            <a href={checkoutUrlFor(p.handle)} target="_blank" rel="noreferrer">
              View Product
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}