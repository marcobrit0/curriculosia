import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { motion } from "motion/react";
import { useMemo } from "react";

const email = "marconmbrito@gmail.com";

type Testimonial = {
  text: string;
  source?: string;
};

const testimonials: Testimonial[] = [
  {
    text: "Great site. Love the interactive interface. You can tell it's designed by someone who wants to use it.",
    source: "via e-mail",
  },
  {
    text: "Truly everything about the UX is so intuitive, fluid and lets you customize your CV how you want and so rapidly. I thank you so much for putting the work to release something like this.",
    source: "via e-mail",
  },
  {
    text: "I want to appreciate you for making your projects #openSource, most especially your Currículos IA, which is the handiest truly-free resume maker I've come across. This is a big shoutout to you. Well done!",
    source: "via e-mail",
  },
  {
    text: "I'd like to appreciate the great work you've done with curriculos.ia.br. The website's design, smooth functionality, and ease of use under the free plan are really impressive. It's clear that a lot of thought and effort has gone into building and maintaining such a useful platform.",
    source: "via e-mail",
  },
  {
    text: "I just wanted to reach you out and thank you personally for your wonderful project curriculos.ia.br. It is very valuable, and the fact that it is open source, makes it all the more meaningful, since there are lots of people who struggle to make their CV look good. For my part, it saved me a lot of time and helped me shape my CV in a very efficient way.",
    source: "via e-mail",
  },
  {
    text: "I appreciate your effort in open-sourcing and making it free for everyone to use, it's a great effort. By using this platform, I got a job secured in the government sector of Oman, that too in a ministry. Thank you for providing this platform. Keep going, appreciate the effort. ❤️",
    source: "via e-mail",
  },
  {
    text: "Your CV generator just saved my day! Thank you so much, great work!",
    source: "via e-mail",
  },
  {
    text: "I want to express my heartfelt gratitude and admiration for your incredible work and remarkable skills. Your projects, especially the Resume Builder, have been immensely helpful to me, and I deeply appreciate the effort and creativity you've poured into them.",
    source: "via e-mail",
  },
  {
    text: "Hey! Thank you so much for making this fantastic tool! It helped me get a new job as a Research Software Engineer at Arizona State University.",
    source: "via e-mail",
  },
  {
    text: "Wow, what an impressive profile! You are very talented. I'm also a fellow SWE on the job hunt and I came across a linked to Currículos IA on Reddit and gave it a shot. This could easily be a paid product. Very clean and useful.",
    source: "Reddit",
  },
  {
    text: "Thank you for creating Currículos IA. It is an amazing product, and I love the design and how it simplifies the resume-making experience. I've been trying to create a good resume for a decade to find my first job in tech, and your tool has been incredibly helpful.",
    source: "via e-mail",
  },
];

type TestimonialCardProps = {
  testimonial: Testimonial;
};

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <motion.figure
      className="group relative w-[320px] shrink-0 sm:w-[360px] md:w-[400px]"
      initial={{ scale: 1 }}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      style={{ willChange: "transform" }}
    >
      <div className="relative flex h-full flex-col rounded-md border bg-card p-5 shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
        <blockquote className="flex-1">
          <p className="leading-relaxed text-muted-foreground">"{testimonial.text}"</p>
        </blockquote>
        {testimonial.source && (
          <figcaption className="mt-3 text-xs font-medium text-muted-foreground/60">{testimonial.source}</figcaption>
        )}
      </div>
    </motion.figure>
  );
}

type MarqueeRowProps = {
  rowId: string;
  testimonials: Testimonial[];
  direction: "left" | "right";
  duration?: number;
};

function MarqueeRow({ testimonials, rowId, direction, duration = 30 }: MarqueeRowProps) {
  const animateX = direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"];

  return (
    <motion.div
      className="flex items-start gap-x-4 will-change-transform"
      animate={{ x: animateX }}
      transition={{ x: { repeat: Infinity, repeatType: "loop", duration, ease: "linear" } }}
    >
      {testimonials.map((testimonial, index) => (
        <TestimonialCard key={`${rowId}-${index}`} testimonial={testimonial} />
      ))}
    </motion.div>
  );
}

export function Testimonials() {
  const { row1, row2 } = useMemo(() => {
    const half = Math.ceil(testimonials.length / 2);
    const firstHalf = testimonials.slice(0, half);
    const secondHalf = testimonials.slice(half);

    return {
      row1: [...firstHalf, ...firstHalf],
      row2: [...secondHalf, ...secondHalf],
    };
  }, []);

  return (
    <section id="testimonials" className="overflow-hidden py-12 md:py-16 xl:py-20">
      <motion.div
        className="mb-10 flex flex-col items-center space-y-4 px-4 text-center md:px-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-semibold tracking-tight md:text-4xl xl:text-5xl">
          <Trans>O que dizem nossos usuários</Trans>
        </h2>

        <p className="max-w-4xl leading-relaxed text-balance text-muted-foreground">
          <Trans>
            Pessoas de todo o mundo usam o Currículos IA para conseguir empregos, mudar de carreira e se destacar em
            processos seletivos. Se quiser compartilhar sua história, envie um e-mail para{" "}
            <a
              href={`mailto:${email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2 transition-colors hover:text-primary"
            >
              {email}
            </a>
            .
          </Trans>
        </p>
      </motion.div>

      <div
        className="relative"
        role="region"
        aria-label={t`Depoimentos de usuários`}
        aria-live="off"
      >
        {/* Left fade */}
        <div className="pointer-events-none absolute inset-s-0 top-0 bottom-0 z-10 w-16 bg-linear-to-r from-background to-transparent sm:w-24 md:w-32 lg:w-48" />

        {/* Right fade */}
        <div className="pointer-events-none absolute inset-e-0 top-0 bottom-0 z-10 w-16 bg-linear-to-l from-background to-transparent sm:w-24 md:w-32 lg:w-48" />

        <div className="flex flex-col gap-y-6">
          <MarqueeRow testimonials={row1} rowId="row1" direction="left" duration={50} />
          <MarqueeRow testimonials={row2} rowId="row2" direction="right" duration={55} />
        </div>
      </div>
    </section>
  );
}
