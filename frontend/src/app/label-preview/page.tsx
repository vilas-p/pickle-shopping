import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jar Label Preview",
  description:
    "Internal preview for the Appa & Amma's Pickles jar label concept.",
  robots: { index: false, follow: false },
};

const ingredients = [
  "Raw Mango",
  "Red Chilli Powder",
  "Mustard Powder",
  "Fenugreek",
  "Salt",
  "Asafoetida",
  "Cold-Pressed Sesame Oil",
];

const pairings = ["Hot rice", "Curd rice", "Dal rice", "Chapati"];

const compliance = [
  "Batch No.: __________",
  "Packed On: __________",
  "Best Before: __________",
  "MRP: __________",
  "FSSAI No.: __________",
  "Customer Care: __________",
];

export default function LabelPreviewPage() {
  return (
    <section className="min-h-screen bg-brand-cream-100/70 py-12 text-brand-earth-900">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="badge-tag">Packaging Concept</p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Jar Label Preview
          </h1>
          <p className="mt-4 text-base text-brand-earth-700/80 sm:text-lg">
            First-pass front and back label for the mango jar, built from the
            current brand story and real product facts.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <article className="mx-auto flex w-full max-w-md flex-col items-center rounded-[2.5rem] border-[10px] border-brand-accent-900 bg-[#fcfaf4] p-6 shadow-warm ring-1 ring-brand-secondary-300/60">
            <div className="w-full rounded-[2rem] border-2 border-brand-secondary-500 px-6 py-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-accent-900">
                Handmade Near Bidar, Karnataka
              </p>
              <div className="mt-5 border-y border-brand-secondary-500/70 py-5">
                <p className="font-script text-3xl text-brand-primary-700">
                  Appa & Amma&apos;s
                </p>
                <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-[0.06em] text-brand-earth-900 sm:text-5xl">
                  Pickles
                </h2>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-accent-800">
                  Traditional Mango Pickle
                </p>
                <p className="mt-2 font-display text-3xl font-semibold text-brand-primary-700">
                  Avakaya
                </p>
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-brand-cream-100/90 px-5 py-4 ring-1 ring-brand-cream-200">
                <p className="font-script text-2xl text-brand-earth-900">
                  A jar from home, wherever home is.
                </p>
              </div>

              <div className="mt-7 grid gap-3 text-sm text-brand-earth-800 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-brand-cream-200">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-brand-earth-700/65">
                    Net Wt.
                  </p>
                  <p className="mt-1 font-semibold">500 g</p>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-brand-cream-200">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-brand-earth-700/65">
                    Batch Style
                  </p>
                  <p className="mt-1 font-semibold">Small batch</p>
                </div>
              </div>
            </div>
          </article>

          <article className="mx-auto w-full max-w-md rounded-[2rem] border-2 border-brand-earth-200 bg-white p-6 shadow-card">
            <div className="rounded-[1.5rem] border border-brand-cream-200 bg-brand-cream-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-accent-900">
                Back Label
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-brand-earth-900">
                Traditional Mango Pickle
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-brand-earth-800">
                There is a house near Bidar where pickle is still made the slow
                way. Our jars are prepared in small batches so what reaches your
                table still feels personal, patient, and familiar.
              </p>

              <div className="mt-6 grid gap-5">
                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-earth-700/70">
                    Ingredients
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-earth-800">
                    {ingredients.join(", ")}
                  </p>
                </section>

                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-earth-700/70">
                    Best With
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pairings.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-brand-secondary-100 px-3 py-1 text-xs font-medium text-brand-earth-800 ring-1 ring-brand-secondary-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-earth-700/70">
                    Storage
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-earth-800">
                    Use a dry spoon. Keep sealed after opening. Refrigerate
                    after opening for best taste.
                  </p>
                </section>

                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-earth-700/70">
                    Print Block
                  </p>
                  <div className="mt-2 grid gap-1 text-sm text-brand-earth-800">
                    {compliance.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </article>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-[2rem] bg-white/85 p-6 shadow-card ring-1 ring-brand-cream-200">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-earth-700/70">
            Direction Notes
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-brand-cream-50 px-4 py-4">
              <p className="font-medium text-brand-earth-900">What is working</p>
              <p className="mt-2 text-sm text-brand-earth-800">
                The arched silhouette and quiet copy make the jar feel heritage-led rather than mass-market.
              </p>
            </div>
            <div className="rounded-2xl bg-brand-cream-50 px-4 py-4">
              <p className="font-medium text-brand-earth-900">What stays restrained</p>
              <p className="mt-2 text-sm text-brand-earth-800">
                No discount language, no exaggerated claims, and no crowded decorative imagery behind critical text.
              </p>
            </div>
            <div className="rounded-2xl bg-brand-cream-50 px-4 py-4">
              <p className="font-medium text-brand-earth-900">Next print step</p>
              <p className="mt-2 text-sm text-brand-earth-800">
                Lock the front hierarchy first, then add regulatory details and variant color cues for Lemon and Bitter Gourd.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}