import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/shared/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "There is a house where Appa and Amma still make pickle the slow way. This is the story of how that kitchen began reaching tables far from home.",
  keywords: [
    "Appa and Amma pickles",
    "Bidar Karnataka pickles",
    "family pickle story",
    "homemade pickle brand",
    "small batch pickles India",
  ],
  alternates: { canonical: "/about" },
};

const beliefPoints = [
  "Slow is not a limitation. Slow is the recipe.",
  "A jar made for family should never feel manufactured.",
  "Patience is an ingredient, not a delay.",
  "The feeling matters as much as the flavor.",
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-spice-wash text-white">
        <div className="container-page py-24 sm:py-32">
          <div className="max-w-3xl">
            <p className="font-script text-2xl text-brand-secondary-300">
              Our family story
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-6xl">
              There is a house 
              <span className="block text-brand-primary-400">
                where the jars still wait by the window.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/80">
              Long before there was a brand, there was only a kitchen, a woman
              with turmeric-stained fingers, and a man who tasted everything
              twice before he said it was ready.
            </p>
          </div>
        </div>

        <div className="relative mx-auto -mt-6 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-3xl bg-brand-earth-800 shadow-warm ring-1 ring-white/10">
          <Image
            src="/images/about/01-kitchen-dawn.png"
            alt="Village kitchen near Bidar at the start of the day"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-earth-900/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-10">
            <p className="font-script text-xl text-brand-secondary-200 sm:text-2xl">
              Our Home
            </p>
            <p className="mt-1 text-sm text-white/80 sm:text-base">
              Where patience, memory, and family recipes still shape every batch.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="badge-tag">Why we exist</p>
            <h2 className="section-heading mt-3 font-display">
              Every jar begins with a family. Every spoonful brings you closer to home.
            </h2>
            <div className="mt-5 space-y-4 text-brand-earth-700/85">
              <p>
                In many Indian homes, pickle was never just a side dish. It completed every meal and made even simple curd rice feel special. In our home, Appa and Amma prepared every batch with patience and care. These recipes were passed down through generations and shared only with family.
              </p>
              <p>
                {/* It was the children of the house, grown now and living in rented
                rooms, who first said what the family had always quietly known:
                the pickle did not just taste of mango or lime. It tasted of a
                particular kitchen, a particular window, a particular pair of
                hands. */}

                As the children moved to cities like Bengaluru, Hyderabad, and Pune, every visit home ended with a jar of pickle packed in their bags. Soon, the phone calls began. "Can you send some more pickle?" We realised they were not only missing the taste. They were missing home, family meals, and the comfort that came with them.
              </p>
              <p>
                {/* Appa & Amma&apos;s Pickles exists so that feeling does not stay
                locked inside one house. */}

              That is why <strong>Appa &amp; Amma's Pickles</strong> exists. We wanted to share that feeling with everyone living away from home. Every jar is made using the same traditional recipes, honest ingredients, and loving care as the ones prepared for our own family. Because some foods fill the stomach, but the ones made with love fill the heart.
              </p>
            </div>
          </div>

          <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-warm ring-1 ring-brand-cream-200">
            <Image
              src="/images/about/03-village-lane-dawn.png"
              alt="A quiet village lane near Bidar in the early morning"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="bg-brand-cream-100/60 py-20">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <figure className="relative order-last aspect-[4/5] overflow-hidden rounded-3xl shadow-warm ring-1 ring-brand-cream-200 md:order-first">
            <Image
              src="/images/about/02-amma-cutting-mango.png"
              alt="Hands cutting mango for a small batch of pickle"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </figure>

          <div>
            <p className="badge-tag">Founder story</p>
            <h2 className="section-heading mt-3 font-display">
              It all started in Appa & Amma's kitchen.
            </h2>
            <div className="mt-5 space-y-4 text-brand-earth-700/85">
              <p>
                Amma learned these recipes from her mother. She believed every pickle should be made slowly, with fresh ingredients, patience, and care. Every batch was prepared by hand, just as it had been for generations.
              </p>
              <p>
                Appa was the final taste tester. No jar was filled until he was happy with the flavour. Together, they never chased perfection. They simply made food the way they would for their own family.
              </p>
              <p>
                What began as a tradition at home slowly became something bigger. As family members moved away, they kept asking for the same jars. That is how Appa & Amma's Pickles was born—to share the taste and warmth of home with every family.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="badge-tag">Why the name matters</p>
            <h2 className="section-heading mt-3 font-display">
              We could have chosen a modern name. We chose the words most people call from the lunch table.
            </h2>
            <div className="mt-5 space-y-4 text-brand-earth-700/85">
              <p>
                Appa and Amma are not a brand device. They are the first people
                many of us think of when we think of home food, patience, and
                the quiet way Indian families show love.
              </p>
              <p>
                Putting their names on the jar is not a marketing decision. It
                is an admission. This pickle has parents, and we are telling you
                exactly whose kitchen it comes from.
              </p>
              <p>
                The name also sets our standard. If it is not good enough for
                our own table, it is not ready for yours.
              </p>
            </div>
          </div>

          <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-warm ring-1 ring-brand-cream-200">
            <Image
              src="/images/about/05-kitchen-clay-jars.png"
              alt="Clay jars and vessels in a traditional family kitchen"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="bg-brand-cream-100/60 py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we believe"
            title="The feeling matters as much as the flavor."
            description="A jar made in an afternoon by a machine and a jar made over days by a person who tastes it, waits, and tastes it again are not the same thing."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {beliefPoints.map((point) => (
              <div
                key={point}
                className="rounded-2xl bg-white p-6 text-brand-earth-800 shadow-card ring-1 ring-brand-cream-200"
              >
                <p className="text-base leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="badge-tag">Our promise</p>
            <h2 className="section-heading mt-3 font-display">
              We are not asking you to try a new brand. We are asking you to remember something old.
            </h2>
            <div className="mt-5 space-y-4 text-brand-earth-700/85">
              <p>
                We know that what reaches your table has to earn trust slowly.
                That is why every batch is prepared in small quantities, by hand,
                and never hurried for the sake of volume.
              </p>
              <p>
                We want the first smell to arrive before the memory does, and
                then for the memory to arrive anyway: steel plates on the table,
                rice just off the stove, someone asking if you want a little
                more.
              </p>
              <p>
                The promise underneath every label is simple: the jar was made
                slowly, tasted before it left, and prepared with the same care we
                would give our own family.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Find Your Jar
              </Link>
              <Link href="/contact" className="btn-secondary">
                Talk To Our Family
              </Link>
            </div>
          </div>

          <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-warm ring-1 ring-brand-cream-200">
            <Image
              src="/images/about/04-jar-sealed-dusk.png"
              alt="A jar sealed by hand at the end of the day"
              fill
              sizes="(min-width: 1024px) 32vw, 100vw"
              className="object-cover"
            />
          </figure>
        </div>
      </section>
    </>
  );
}
