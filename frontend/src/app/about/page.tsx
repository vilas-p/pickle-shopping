import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/shared/ui/SectionHeading";

export const metadata: Metadata = {
  title: "A Day With Appa & Amma — A Documentary",
  description:
    "Spend a day in a small Indian village with Appa and Amma — from the first call of the rooster to the last jar sealed at dusk. The story of homemade Mango, Lemon and Bitter Gourd pickles, told the way a documentary would film it.",
  keywords: [
    "Appa and Amma pickles documentary",
    "village pickle making India",
    "homemade pickle story",
    "traditional Indian kitchen",
    "small batch pickles",
  ],
  alternates: { canonical: "/about" },
};

/* Suggested b-roll for production:
 *  /images/about/05-rooster-dawn.jpg     — silhouette of a rooster on a mud wall
 *  /images/about/06-village-path.jpg     — Appa walking down a dirt path with a jute bag
 *  /images/about/07-mango-tree.jpg       — green mangoes hanging in morning light
 *  /images/about/08-amma-kitchen.jpg     — Amma in the doorway of the kitchen
 *  /images/about/09-cutting-board.jpg    — top-down of mango being hand-cut
 *  /images/about/10-spice-grind.jpg      — mortar & pestle crushing red chilli
 *  /images/about/11-sun-jars.jpg         — clay jars sun-curing on terracotta
 *  /images/about/12-lamp-evening.jpg     — oil lamp lit, jar being sealed by hand
 */

export default function AboutPage() {
  return (
    <>
      {/* OPENING TITLE CARD */}
      <section className="relative overflow-hidden bg-brand-earth-900 text-white">
        <div className="container-page py-24 text-center sm:py-32">
          <p className="font-script text-2xl text-brand-secondary-300">
            A short documentary in seven scenes
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-6xl">
            A Day With
            <span className="block text-brand-primary-400">Appa &amp; Amma</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Somewhere in rural India, a small kitchen wakes before the sun. A
            husband and wife. Three pickles. A tradition older than either of
            them. This is what a single day inside their world looks like.
          </p>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-white/60">
            Press play. Settle in.
          </p>
        </div>

        <div className="relative mx-auto -mt-8 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-3xl bg-brand-earth-800 shadow-warm ring-1 ring-white/10">
          <Image
            src="/images/story-grandmother.svg"
            alt="Wide establishing shot of the village kitchen at dawn"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-earth-900/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-10">
            <p className="font-script text-xl text-brand-secondary-200 sm:text-2xl">
              EXT. VILLAGE — JUST BEFORE SUNRISE
            </p>
            <p className="mt-1 text-sm text-white/80 sm:text-base">
              A rooster calls. Somewhere, a stove is being lit.
            </p>
          </div>
        </div>
      </section>

      {/* SCENE 01 — THE VILLAGE */}
      <section className="container-page py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="font-script text-xl text-brand-primary-700">
              Scene One
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
              The village wakes slowly.
            </h2>
            <div className="mt-5 space-y-4 text-brand-earth-700/85">
              <p>
                The camera opens on a narrow lane, still wet with last
                night&apos;s dew. Bullocks shuffle past a tea stall. A radio
                plays an old film song from a window we cannot see. Coconut
                trees lean over mud walls painted with white kolam patterns
                that the rain has only half-erased.
              </p>
              <p>
                There is no factory here. No conveyor belts. No flashing
                lights. The loudest sound in the village is a temple bell
                three streets away — and the soft, steady thud of a knife
                meeting a wooden board.
              </p>
              <p>
                Down at the end of this lane is a single-storey house with a
                sloping tiled roof and a courtyard washed with cow-dung paste,
                the way grandmothers have always preferred. This is where it
                all happens. This is where the pickle is made.
              </p>
            </div>
          </div>

          <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-warm ring-1 ring-brand-cream-200">
            <Image
              src="/images/about-mango-cutting.svg"
              alt="A village morning — mud lane, coconut trees, slow light"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand-earth-800">
              00:42 · Establishing shot
            </figcaption>
          </figure>
        </div>
      </section>

      {/* SCENE 02 — THE KITCHEN */}
      <section className="bg-brand-cream-100/60 py-20">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <figure className="relative order-last aspect-[4/5] overflow-hidden rounded-3xl shadow-warm ring-1 ring-brand-cream-200 md:order-first">
            <Image
              src="/images/hero-pickle-jar.svg"
              alt="The kitchen — clay jars, brass vessels, sunlight through a small window"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand-earth-800">
              02:15 · The kitchen
            </figcaption>
          </figure>

          <div>
            <p className="font-script text-xl text-brand-primary-700">
              Scene Two
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
              Inside the kitchen — a museum that is still in use.
            </h2>
            <div className="mt-5 space-y-4 text-brand-earth-700/85">
              <p>
                The doorway is low; you have to bend slightly to enter. The
                first thing the camera finds is the smell — mustard seeds
                roasted yesterday, fenugreek hiding in a glass jar, the
                memory of last summer&apos;s mango still clinging to the
                walls.
              </p>
              <p>
                On one side, a row of clay urns, each with a name written
                in chalk. On the other, a stone grinder Amma&apos;s
                grandmother once owned. A brass measure that has not been
                replaced in forty-odd years. A wooden ladle, blackened with
                use, that Amma will not allow anyone else to touch.
              </p>
              <p>
                There is a small window above the stove. Through it, you can
                just see the corner of the courtyard — and the line of empty
                jars waiting in the sun, like patient students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 03 — APPA AT DAWN */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-4xl">
          <p className="font-script text-xl text-brand-primary-700">
            Scene Three
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
            5:40 a.m. — Appa goes to the farms.
          </h2>
          <div className="mt-6 space-y-4 text-brand-earth-700/85">
            <p>
              The camera follows Appa down the lane, jute bag over his
              shoulder, a small knife tucked into a cloth pouch at his waist.
              He does not say much. He never does at this hour. He nods at the
              tea-stall owner. The tea-stall owner nods back. They have been
              doing this for thirty years.
            </p>
            <p>
              At the orchard, Appa walks under the mango trees in silence. He
              touches the fruit. Lifts one, weighs it in his palm. Smells it.
              Puts it back. He is looking for a kind of green only he seems to
              recognize — firm, tart, not yet ready to be a fruit.
            </p>
            <p>
              <em>
                &ldquo;A pickle mango is not a sweet mango,&rdquo;
              </em>{" "}
              he tells the camera, almost to himself.{" "}
              <em>
                &ldquo;A pickle mango is angry. It needs salt to become
                kind.&rdquo;
              </em>
            </p>
            <p>
              He fills the bag carefully, pays the farmer in cash and a
              handshake, and walks home as the sky turns the colour of saffron
              water.
            </p>
          </div>
        </div>
      </section>

      {/* SCENE 04 — AMMA AT THE STOVE */}
      <section className="bg-brand-cream-100/60 py-20">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="font-script text-xl text-brand-primary-700">
              Scene Four
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
              7:00 a.m. — Amma begins.
            </h2>
            <div className="mt-5 space-y-4 text-brand-earth-700/85">
              <p>
                Amma has already lit the stove. She is wearing a faded
                cotton sari, the edges tucked at the waist. Her hair is
                pinned back. She does not look at the clock once during this
                scene.
              </p>
              <p>
                On the floor, on a wide steel plate, the mangoes are laid
                out. She picks each one up, examines it, rejects two,
                rinses the rest with well water. The knife she uses is older
                than her marriage. She sharpens it on a stone every Sunday.
              </p>
              <p>
                The camera moves close. We watch her hands. They are
                unhurried. The cuts are neat — uneven on purpose, because, as
                she says,{" "}
                <em>
                  &ldquo;a machine cuts the same way every time. A hand cuts
                  the way the mango wants to be cut.&rdquo;
                </em>
              </p>
              <p>
                She salts the pieces and walks away. The mangoes will rest
                until afternoon. Pickle, she reminds us, is mostly waiting.
              </p>
            </div>
          </div>

          <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-warm ring-1 ring-brand-cream-200">
            <Image
              src="/images/story-grandmother.svg"
              alt="Amma cutting mango with an old steel knife on a low wooden stool"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand-earth-800">
              07:00 · Mise en place
            </figcaption>
          </figure>
        </div>
      </section>

      {/* SCENE 05 — THE PROCESS, IN HOURS */}
      <section className="container-page py-20">
        <SectionHeading
          eyebrow="Scene Five"
          title="The process — measured in hours, not minutes."
          description="The documentary cuts to a slow montage. The light shifts. Time passes. Everything happens by hand."
        />

        <ol className="relative mx-auto mt-14 max-w-3xl border-l-2 border-brand-primary-200 pl-8">
          {[
            {
              time: "08:30",
              title: "The masala is born",
              body: "Red chilli, mustard, fenugreek, asafoetida, rock salt — toasted gently in cast iron, ground on stone, never in a machine. The kitchen smells like a temple festival.",
            },
            {
              time: "11:00",
              title: "The mangoes are tossed",
              body: "Amma folds the salted mango into the masala, slowly, with both hands. There is no recipe card. There is only her, the bowl, and forty years of practice.",
            },
            {
              time: "13:00",
              title: "Rest in clay",
              body: "Everything is transferred to a clay urn. The urn is covered with a cloth, tied with twine, and pushed into the corner where the wall stays cool. Now we wait.",
            },
            {
              time: "15:30",
              title: "Sun-curing on terracotta",
              body: "The smaller jars are taken to the courtyard. They sit in a row on the warm terracotta tiles, lids loose, drinking sunlight. Three to five days of this — that is the only preservative our family has ever used.",
            },
            {
              time: "18:00",
              title: "Tempering in cold-pressed oil",
              body: "Sesame oil is heated until it just begins to shimmer. Mustard, dried red chilli, curry leaf — they crackle, then go quiet. The oil is poured, still warm, over the resting pickle. A hush falls over the kitchen.",
            },
          ].map((s) => (
            <li key={s.time} className="relative mb-10 last:mb-0">
              <span
                aria-hidden
                className="absolute -left-[2.4rem] mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary-600 ring-4 ring-brand-cream-100"
              >
                <span className="block h-2 w-2 rounded-full bg-white" />
              </span>
              <p className="font-script text-xl text-brand-primary-700">
                {s.time}
              </p>
              <p className="mt-1 font-display text-xl text-brand-earth-900">
                {s.title}
              </p>
              <p className="mt-2 text-brand-earth-700/85">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* INTERVIEW PULL QUOTE */}
      <section className="container-page py-12">
        <figure className="mx-auto max-w-3xl rounded-3xl bg-brand-primary-600 px-8 py-14 text-center text-white shadow-warm sm:px-16">
          <p className="font-script text-3xl text-brand-secondary-200">
            Interview · Amma
          </p>
          <blockquote className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
            &ldquo;People ask me what is the secret. There is no secret. There
            is only time. If you give a pickle time, it will give you
            everything.&rdquo;
          </blockquote>
          <figcaption className="mt-6 text-sm uppercase tracking-wider text-brand-secondary-200/90">
            — Amma, on a low stool by the kitchen door
          </figcaption>
        </figure>
      </section>

      {/* SCENE 06 — THE PASSION */}
      <section className="bg-brand-cream-100/60 py-20">
        <div className="container-page mx-auto max-w-4xl">
          <p className="font-script text-xl text-brand-primary-700">
            Scene Six
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
            Why two people, in their sixties, still do this every day.
          </h2>
          <div className="mt-6 space-y-4 text-brand-earth-700/85">
            <p>
              Late afternoon. The shadows in the courtyard have grown long.
              Appa is sitting on a wooden bench, peeling lemons for tomorrow
              with a small knife. Amma is checking on a clay jar, lifting the
              cloth, leaning in to smell it. She nods to herself. The jar
              passes.
            </p>
            <p>
              We ask them, on camera, the obvious question. Why still do this?
              Why not rest? Why not pass it on, scale it up, sell it off?
            </p>
            <p>
              Appa thinks for a long time. Then he points at the jars in the
              sun. <em>&ldquo;Those are not jars,&rdquo;</em> he says.{" "}
              <em>
                &ldquo;Those are letters. Every one of them is a letter we are
                writing to someone&apos;s home.&rdquo;
              </em>
            </p>
            <p>
              Amma does not answer at all. She just smiles, walks back into
              the kitchen, and starts cleaning the next batch of bitter gourd.
              The camera, quietly, follows her.
            </p>
          </div>
        </div>
      </section>

      {/* SCENE 07 — THE SEAL */}
      <section className="container-page py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-warm ring-1 ring-brand-cream-200">
            <Image
              src="/images/about-mango-cutting.svg"
              alt="A finished jar of pickle being sealed by hand at dusk"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand-earth-800">
              19:24 · Closing shot
            </figcaption>
          </figure>

          <div>
            <p className="font-script text-xl text-brand-primary-700">
              Scene Seven
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold text-brand-earth-900 sm:text-4xl">
              7:30 p.m. — One jar, sealed by lamplight.
            </h2>
            <div className="mt-5 space-y-4 text-brand-earth-700/85">
              <p>
                The kitchen has cooled. The stove is out. Outside, a single
                oil lamp has been lit at the doorway, the way the older
                generation always did at dusk.
              </p>
              <p>
                Amma takes a clean glass jar. She tilts the urn. Pickle slides
                in, slowly, glossy with oil, the colour of a setting sun.
                Appa wipes the rim with a cloth. Together, they screw the lid
                on. He writes the batch number on the label by hand. She ties
                a small cotton thread around the neck of the jar — a habit she
                cannot remember the origin of, but cannot stop doing.
              </p>
              <p>
                That jar will leave the village tomorrow morning. It will be
                packed into a box. It will travel by road, then by truck, then
                by another road. And in three or four days, somebody, somewhere
                in India, will open it at their dining table.
              </p>
              <p>
                When they do, a small piece of this kitchen, this courtyard,
                this village — and this day you have just spent — will arrive
                with it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CARD */}
      <section className="bg-brand-earth-900 py-20 text-white">
        <div className="container-page mx-auto max-w-3xl text-center">
          <p className="font-script text-2xl text-brand-secondary-300">
            End credits
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Thank you for staying till the end.
          </h2>
          <p className="mt-5 text-white/80">
            Appa &amp; Amma&apos;s Pickles is a family-owned, village-based
            kitchen in India. We make three pickles —{" "}
            <strong>Mango</strong>, <strong>Lemon</strong> and{" "}
            <strong>Bitter Gourd</strong> — by hand, in small batches, using
            recipes that have not changed in three generations.
          </p>
          <p className="mt-4 text-white/70">
            If this story moved you even a little, the best way to honour it
            is to taste it.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="btn-primary !bg-white !text-brand-primary-700 hover:!bg-brand-cream-100"
            >
              Bring a Jar Home
            </Link>
            <Link
              href="/contact"
              className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-brand-primary-700"
            >
              Write to Appa &amp; Amma
            </Link>
          </div>

          <p className="mt-12 text-xs uppercase tracking-[0.3em] text-white/50">
            A homemade film · Filmed in one village · No re-shoots
          </p>
        </div>
      </section>
    </>
  );
}
