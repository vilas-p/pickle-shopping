import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-script text-3xl text-brand-primary-700">Oops!</p>
      <h1 className="mt-2 font-display text-5xl font-bold text-brand-earth-900">
        Page not found
      </h1>
      <p className="mt-4 text-brand-earth-700/80">
        Looks like the page you're looking for has gone for a walk in the village.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn-primary">Back to Home</Link>
        <Link href="/products" className="btn-secondary">Browse Pickles</Link>
      </div>
    </div>
  );
}
