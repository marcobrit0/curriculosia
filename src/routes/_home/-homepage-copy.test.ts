import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

const publicCopyFiles = [
  "./index.tsx",
  "./-sections/header.tsx",
  "./-sections/hero.tsx",
  "./-sections/how-it-works.tsx",
  "./-sections/ai.tsx",
  "./-sections/templates.tsx",
  "./-sections/pricing.tsx",
  "./-sections/privacy.tsx",
  "./-sections/faq.tsx",
  "./-sections/prefooter.tsx",
  "./-sections/footer.tsx",
  "../../constants/pricing.ts",
  "../__root.tsx",
  "../auth/login.tsx",
  "../auth/register.tsx",
  "../auth/forgot-password.tsx",
  "../auth/reset-password.tsx",
  "../auth/resume-password.tsx",
  "../auth/-components/social-auth.tsx",
];

const bannedPublicPositioning = [
  /open[- ]source/i,
  /c[óo]digo aberto/i,
  /100% gratuito/i,
  /gratuito para sempre/i,
  /completamente gratuito/i,
  /totalmente gratuito/i,
  /free forever/i,
  /self-host/i,
  /auto-hospedagem/i,
  /Crowdin/i,
  /Docker/i,
  /GitHub/i,
  /docs\.curriculos\.ia\.br/i,
  /Create one now/,
  /Sign in now/,
  /milhares/i,
];

function readPublicCopy() {
  return publicCopyFiles.map((path) => readFileSync(new URL(path, import.meta.url), "utf8")).join("\n");
}

describe("public homepage and auth copy", () => {
  it("does not expose legacy open-source or free-forever positioning", () => {
    const copy = readPublicCopy();

    for (const banned of bannedPublicPositioning) {
      expect(copy, `Unexpected public copy matching ${banned}`).not.toMatch(banned);
    }
  });

  it("states the commercial model clearly", () => {
    const copy = readPublicCopy();

    expect(copy).toContain("R$ 24,99/mês");
    expect(copy).toContain("R$ 9,99");
    expect(copy).toMatch(/exporta[çc][ãa]o em PDF.*paga|PDF.*pago|paga.*PDF/i);
    expect(copy).toContain("Criar currículo grátis");
  });
});
