interface Props { params: { slug: string } }

export default async function ProductPage({ params }: Props) {
  const res = await fetch(`/api/products/${params.slug}`, { cache: 'no-store' });
  const json = await res.json();
  const p = json?.data;
  if (!p) return <main className="container">Not found.</main>;
  return (
    <main className="container">
      <h1 className="text-xl font-bold">{p.name}</h1>
      {p.price != null && <p>Price: {p.price}</p>}
    </main>
  );
}
