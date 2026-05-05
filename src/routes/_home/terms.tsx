import { createFileRoute } from "@tanstack/react-router";

import { PRICING } from "@/constants/pricing";

import { Footer } from "./-sections/footer";

export const Route = createFileRoute("/_home/terms")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Currículos IA" },
      {
        name: "description",
        content:
          "Termos de Uso do Currículos IA, produto da MadeofIA — condições de uso da conta, conteúdo, planos, pagamentos e cancelamento.",
      },
    ],
  }),
  component: RouteComponent,
});

const EFFECTIVE_DATE = "5 de maio de 2026";

function RouteComponent() {
  return (
    <main id="main-content" className="relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <article className="mx-auto max-w-3xl py-16 lg:py-24">
          <header className="mb-12 space-y-4">
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Legal</p>
            <h1 className="text-4xl font-bold tracking-tight">Termos de Uso</h1>
            <p className="text-sm text-muted-foreground">Vigência: {EFFECTIVE_DATE}</p>
          </header>

          <div className="space-y-10 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">1. Aceitação</h2>
              <p>
                Estes Termos de Uso ("Termos") regem o acesso e uso do Currículos IA ("Serviço"), produto da empresa{" "}
                <strong>MadeofIA</strong>, inscrita no CNPJ sob o nº <strong>65.599.230/0001-64</strong>. Ao criar uma
                conta ou utilizar o Serviço, você declara ter lido, entendido e aceito integralmente estes Termos e a
                Política de Privacidade. Se você não concordar, não utilize o Serviço.
              </p>
              <p>
                Em sua fatura ou extrato bancário, cobranças relacionadas ao Currículos IA podem aparecer como{" "}
                <strong>MadeofIA</strong>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">2. O Serviço</h2>
              <p>
                O Currículos IA é uma ferramenta de criação de currículos online, com recursos opcionais de inteligência
                artificial, exportação em PDF e compartilhamento de currículos públicos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">3. Elegibilidade</h2>
              <p>
                Você deve ser maior de 18 anos e legalmente capaz para celebrar contratos. Ao se cadastrar em nome de
                uma pessoa jurídica, você declara possuir poderes para vinculá-la a estes Termos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">4. Conta e segurança</h2>
              <ul className="ml-6 list-disc space-y-2">
                <li>Você é responsável pela veracidade dos dados cadastrais e pela atualização quando necessário.</li>
                <li>Você deve manter sigilo da senha e de qualquer credencial de acesso.</li>
                <li>Recomendamos ativar autenticação em dois fatores (2FA) ou passkeys.</li>
                <li>
                  Você é responsável por todas as atividades realizadas em sua conta. Em caso de uso não autorizado,
                  notifique-nos imediatamente em{" "}
                  <a href="mailto:suporte@curriculos.ia.br" className="font-medium text-primary hover:underline">
                    suporte@curriculos.ia.br
                  </a>
                  .
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">5. Conteúdo do usuário</h2>
              <p>
                Você é o único responsável pelo conteúdo que insere em seus currículos. Ao publicar um currículo de
                forma pública, você reconhece que qualquer pessoa com o link poderá visualizá-lo.
              </p>
              <p>
                Você mantém todos os direitos sobre seu conteúdo. Concede ao Currículos IA uma licença não exclusiva,
                limitada e gratuita para hospedar, processar e exibir seu conteúdo apenas na medida necessária para a
                prestação do Serviço (renderização, geração de PDF, exibição de página pública etc.).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">6. Conduta proibida</h2>
              <p>Você concorda em não utilizar o Serviço para:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Atividades ilícitas, fraudulentas ou que violem direitos de terceiros.</li>
                <li>Tentativas de acesso não autorizado a sistemas, contas ou dados.</li>
                <li>Envio de malware, exploração de vulnerabilidades ou interferência no Serviço.</li>
                <li>Uso de meios automatizados (scraping, bots) sem autorização prévia.</li>
                <li>
                  Inserção de conteúdo difamatório, discriminatório, obsceno ou que viole a legislação brasileira.
                </li>
              </ul>
              <p>Podemos remover conteúdo, suspender ou encerrar contas que violem estas regras.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">7. Planos pagos e pagamentos</h2>
              <h3 className="text-lg font-semibold">7.1. Planos disponíveis</h3>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Gratuito:</strong> criação de currículos, templates e download em PDF mediante desbloqueio por
                  currículo (item 7.2).
                </li>
                <li>
                  <strong>Premium mensal:</strong> {PRICING.premiumMonthly.label}, com acesso ilimitado aos recursos de
                  IA, criação e exportação de currículos.
                </li>
                <li>
                  <strong>Premium anual:</strong> {PRICING.premiumAnnual.label} (equivalente a R${" "}
                  {PRICING.premiumAnnual.monthlyEquivalent}/mês — economia de 30% sobre o plano mensal).
                </li>
                <li>
                  <strong>Desbloqueio único de exportação:</strong> {PRICING.oneTimeExport.label} pagos uma única vez
                  por currículo, permitindo exportar e baixar aquele currículo quantas vezes desejar.
                </li>
              </ul>
              <h3 className="text-lg font-semibold">7.2. Cobrança</h3>
              <p>
                Pagamentos são processados pelo Stripe. Em sua fatura, a cobrança aparecerá como{" "}
                <strong>MadeofIA</strong>. Os preços incluem tributos aplicáveis. Você autoriza a renovação automática
                das assinaturas ao final de cada ciclo, até o cancelamento.
              </p>
              <h3 className="text-lg font-semibold">7.3. Cancelamento e reembolso</h3>
              <p>
                Você pode cancelar a assinatura a qualquer momento em <em>Configurações → Plano e Cobrança</em>. O
                acesso Premium permanecerá ativo até o final do período já pago, sem renovação. Não oferecemos
                reembolsos proporcionais salvo nos casos previstos pelo Código de Defesa do Consumidor (CDC) — em
                particular, o direito de arrependimento em até 7 dias da contratação inicial (art. 49 do CDC).
              </p>
              <h3 className="text-lg font-semibold">7.4. Alteração de preços</h3>
              <p>
                Reservamo-nos o direito de alterar preços. Alterações em assinaturas existentes serão comunicadas com
                antecedência mínima de 30 dias por e-mail.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">8. Recursos de inteligência artificial</h2>
              <p>
                Os recursos de IA usam modelos de provedores parceiros. Conteúdos gerados por IA podem conter
                imprecisões — você é responsável por revisar antes de utilizar. Não recomendamos usar IA para gerar
                declarações fáticas sem verificação.
              </p>
              <p>
                No modo BYO ("traga sua própria chave"), o conteúdo é enviado ao provedor escolhido por você, conforme
                suas próprias políticas. No modo Premium gerenciado, o conteúdo passa pelo OpenRouter, que processa e
                descarta após o atendimento da requisição.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">9. Encerramento</h2>
              <p>
                Você pode encerrar sua conta a qualquer momento em{" "}
                <em>Configurações → Zona de Perigo → Excluir Conta</em>. Podemos suspender ou encerrar contas que violem
                estes Termos, ameacem a segurança do Serviço ou descumpram obrigações legais. Após o encerramento,
                conforme nossa Política de Privacidade, seus dados pessoais serão removidos, exceto registros que somos
                obrigados a reter por lei.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">10. Garantias e limitação de responsabilidade</h2>
              <p>
                O Serviço é fornecido "no estado em que se encontra". Não garantimos disponibilidade ininterrupta nem
                ausência de falhas. Não nos responsabilizamos por decisões profissionais tomadas com base em conteúdos
                gerados pela plataforma.
              </p>
              <p>
                Na máxima extensão permitida pela legislação brasileira, a responsabilidade total da MadeofIA
                relacionada ao Serviço fica limitada ao valor pago por você nos últimos 12 meses.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">11. Foro e legislação aplicável</h2>
              <p>
                Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca do domicílio do
                usuário consumidor, nos termos do art. 101, I, do CDC, para dirimir quaisquer controvérsias decorrentes
                destes Termos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">12. Alterações destes Termos</h2>
              <p>
                Podemos atualizar estes Termos. A versão vigente estará sempre disponível nesta página. Alterações
                materiais serão notificadas por e-mail com antecedência mínima de 30 dias. O uso continuado após a
                vigência significa aceite dos novos termos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">13. Contato</h2>
              <ul className="ml-6 list-disc space-y-1">
                <li>
                  <strong>Suporte geral:</strong>{" "}
                  <a href="mailto:suporte@curriculos.ia.br" className="font-medium text-primary hover:underline">
                    suporte@curriculos.ia.br
                  </a>
                </li>
                <li>
                  <strong>Privacidade e LGPD:</strong>{" "}
                  <a href="mailto:dpo@curriculos.ia.br" className="font-medium text-primary hover:underline">
                    dpo@curriculos.ia.br
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </article>

        <div className="border-t border-border">
          <Footer />
        </div>
      </div>
    </main>
  );
}
