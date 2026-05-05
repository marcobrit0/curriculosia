import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "./-sections/footer";

export const Route = createFileRoute("/_home/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Currículos IA" },
      {
        name: "description",
        content:
          "Como o Currículos IA, produto da MadeofIA, coleta, usa e protege seus dados pessoais nos termos da LGPD (Lei nº 13.709/2018).",
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
            <h1 className="text-4xl font-bold tracking-tight">Política de Privacidade</h1>
            <p className="text-sm text-muted-foreground">Vigência: {EFFECTIVE_DATE}</p>
          </header>

          <div className="space-y-10 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">1. Quem somos</h2>
              <p>
                O Currículos IA é um produto da empresa <strong>MadeofIA</strong>, inscrita no CNPJ sob o nº{" "}
                <strong>65.599.230/0001-64</strong> (a "Controladora" ou "nós"). Esta Política de Privacidade explica
                como tratamos seus dados pessoais quando você utiliza o serviço disponível em{" "}
                <a href="https://curriculos.ia.br" className="font-medium text-primary hover:underline">
                  curriculos.ia.br
                </a>{" "}
                (o "Serviço"), em conformidade com a Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº
                13.709/2018).
              </p>
              <p>
                Em sua fatura ou extrato bancário, cobranças relacionadas ao Currículos IA podem aparecer como{" "}
                <strong>MadeofIA</strong>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">2. Encarregado pelo Tratamento de Dados (DPO)</h2>
              <p>
                Para exercer seus direitos previstos na LGPD ou esclarecer dúvidas sobre o tratamento de seus dados,
                entre em contato com nosso Encarregado pelo Tratamento de Dados Pessoais:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>
                  <strong>Encarregado:</strong> Marco Brito
                </li>
                <li>
                  <strong>E-mail:</strong>{" "}
                  <a href="mailto:dpo@curriculos.ia.br" className="font-medium text-primary hover:underline">
                    dpo@curriculos.ia.br
                  </a>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">3. Dados que coletamos</h2>
              <p>Tratamos as seguintes categorias de dados pessoais:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Dados de cadastro:</strong> nome, e-mail, nome de usuário, foto de perfil (opcional), status
                  de verificação de e-mail e configuração de autenticação em dois fatores.
                </li>
                <li>
                  <strong>Conteúdo do currículo:</strong> tudo o que você inserir nos seus currículos — dados de
                  contato, experiência profissional, formação, projetos, links e outros campos que você decidir
                  preencher.
                </li>
                <li>
                  <strong>Dados de autenticação e segurança:</strong> tokens de sessão, endereço IP, agente do
                  navegador, segredos de 2FA, chaves de passkey e logs de acesso.
                </li>
                <li>
                  <strong>Dados de pagamento:</strong> quando você assina o plano Premium ou compra um desbloqueio de
                  exportação, processamos os dados via parceiros de pagamento autorizados. Não armazenamos números
                  completos de cartão; recebemos apenas o status da transação e identificadores anônimos.
                </li>
                <li>
                  <strong>Dados de uso:</strong> contagem mensal de chamadas de IA (para aplicar limites do plano),
                  estatísticas de visualizações e downloads de currículos públicos.
                </li>
                <li>
                  <strong>Cookies e armazenamento local:</strong> cookies de autenticação e preferências (tema, idioma)
                  e, se você optar pelo modo "traga sua própria chave" (BYO), suas credenciais de provedor de IA são
                  armazenadas apenas no seu navegador.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">4. Bases legais e finalidades</h2>
              <p>Tratamos seus dados com base nas hipóteses legais previstas no art. 7º da LGPD, principalmente:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Execução de contrato</strong> (art. 7º, V): para criar e manter sua conta, hospedar seus
                  currículos, gerar PDFs e processar pagamentos.
                </li>
                <li>
                  <strong>Cumprimento de obrigação legal</strong> (art. 7º, II): para emissão de notas fiscais, retenção
                  de registros fiscais e atendimento a autoridades.
                </li>
                <li>
                  <strong>Legítimo interesse</strong> (art. 7º, IX): para detectar fraudes, manter a segurança do
                  Serviço e produzir métricas agregadas (não identificáveis).
                </li>
                <li>
                  <strong>Consentimento</strong> (art. 7º, I): para envio de comunicações de marketing opcionais — você
                  pode revogar a qualquer momento.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">5. Compartilhamento de dados</h2>
              <p>Compartilhamos dados pessoais apenas com operadores que nos prestam serviços essenciais:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Provedor de pagamentos (Stripe):</strong> para processar assinaturas e pagamentos únicos.
                </li>
                <li>
                  <strong>Provedor de IA (OpenRouter):</strong> apenas para usuários Premium, processa as solicitações
                  de IA. O conteúdo enviado é descartado após o processamento.
                </li>
                <li>
                  <strong>Provedor de e-mail transacional:</strong> para enviar confirmações, recuperação de senha e
                  alertas de segurança.
                </li>
                <li>
                  <strong>Provedor de armazenamento (S3/Supabase):</strong> para hospedar imagens e PDFs gerados.
                </li>
                <li>
                  <strong>Provedores de OAuth (Google, GitHub):</strong> apenas se você optar por fazer login com esses
                  serviços.
                </li>
              </ul>
              <p>
                Não vendemos seus dados. Não compartilhamos dados com fins de publicidade comportamental de terceiros.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">6. Transferência internacional</h2>
              <p>
                Alguns operadores acima podem armazenar dados em servidores fora do Brasil (por exemplo, nos EUA ou na
                União Europeia). Quando isso ocorre, exigimos cláusulas contratuais padrão e medidas técnicas adequadas,
                conforme art. 33 da LGPD.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">7. Retenção</h2>
              <ul className="ml-6 list-disc space-y-2">
                <li>Dados de conta e currículos: enquanto sua conta estiver ativa.</li>
                <li>
                  Após a exclusão da conta: removemos seus dados pessoais imediatamente, exceto registros que somos
                  obrigados a manter por lei (ex.: dados fiscais por até 5 anos).
                </li>
                <li>Backups de banco de dados: até 30 dias após a exclusão.</li>
                <li>Logs de segurança e acesso: até 6 meses.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">8. Seus direitos como titular</h2>
              <p>A LGPD garante a você (art. 18) o direito a, mediante requisição ao Encarregado:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Confirmação e acesso</strong> aos seus dados pessoais.
                </li>
                <li>
                  <strong>Correção</strong> de dados incompletos, inexatos ou desatualizados.
                </li>
                <li>
                  <strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários ou tratados em
                  desconformidade com a lei.
                </li>
                <li>
                  <strong>Portabilidade:</strong> você pode baixar uma cópia dos seus dados a qualquer momento em{" "}
                  <em>Configurações → Zona de Perigo → Baixar meus dados</em>.
                </li>
                <li>
                  <strong>Eliminação dos dados</strong> tratados com base no consentimento, exceto nas hipóteses do art.
                  16 da LGPD.
                </li>
                <li>
                  <strong>Informação sobre compartilhamento</strong> com entidades públicas e privadas.
                </li>
                <li>
                  <strong>Revogação do consentimento</strong>, quando aplicável.
                </li>
                <li>
                  <strong>Reclamação</strong> à Autoridade Nacional de Proteção de Dados (ANPD).
                </li>
              </ul>
              <p>
                A maior parte desses direitos pode ser exercida diretamente no Serviço (edição de perfil, exportação e
                exclusão de conta). Para os demais, escreva para{" "}
                <a href="mailto:dpo@curriculos.ia.br" className="font-medium text-primary hover:underline">
                  dpo@curriculos.ia.br
                </a>
                .
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">9. Crianças e adolescentes</h2>
              <p>
                O Serviço não é destinado a menores de 18 anos. Se identificarmos cadastro de menor sem consentimento de
                responsável, removeremos a conta.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">10. Segurança</h2>
              <p>
                Adotamos medidas técnicas e administrativas razoáveis para proteger seus dados — criptografia em
                trânsito (TLS), armazenamento criptografado em repouso, controles de acesso, segregação de ambientes e
                monitoramento de incidentes. Em caso de incidente de segurança que possa acarretar risco aos titulares,
                notificaremos a ANPD e os titulares afetados nos termos do art. 48 da LGPD.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">11. Alterações</h2>
              <p>
                Podemos atualizar esta Política periodicamente. A versão vigente sempre estará disponível nesta página
                com a data de vigência atualizada. Alterações materiais serão comunicadas por e-mail aos usuários
                ativos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">12. Contato</h2>
              <p>
                Dúvidas, solicitações ou reclamações:{" "}
                <a href="mailto:dpo@curriculos.ia.br" className="font-medium text-primary hover:underline">
                  dpo@curriculos.ia.br
                </a>
                .
              </p>
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
