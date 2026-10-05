# Especificação de Regras de Negócio — Sistema Web de Categorização de Soluções de IA (Taxonomia GOIA v1.2) — Rev. 2

> Construa um sistema em página estática para categorização de soluções de ia, que funcione perfeitamente em dispositivos móveis (mobile) e desktop. Este sistema deve funcionar totalmente em github pages free. O visual deve ser clean e agradável, com toque de credibilidade corporativa, com cores corporativas. Deixe um espaço para um logotipo.
Quero que a parte teórica esteja disponível visualmente em seções, mas de forma que atraia a curiosidade e engajamento do usuário. Entretanto, as partes mais explicativas dos conceitos devem estar disponíveis apenas após o usuário estar logado. Utilizar toda a parte de gerenciamento de login e sistema de login, do arquivo "app1.js". Da mesma forma, a parte de solicitar para fazer parte 
da comunidade, utilizar desta mesma metodologia. Entretanto, em outra google sheet específica com as guias "leads / usuários / inventário de projetos categorizados. Quando o usuário acessa o sistema, 
os projetos / soluções já cadastrados no inventário são listados para o respectivo usuário. A funcionalidade de entrada e categorização dos projetos deverá estar disponível apenas para usuários membros.
Para gerenciamento de cookies, utilizar também a metodologia e sistema já disponível em "app1.js". Entretanto, crie o próprio arquivo "app.js" deste site.
>
> Este documento é a **fonte única de verdade** das regras de negócio. Ele consolida duas fontes:
>
> | Fonte | Papel | Precedência |
> |---|---|---|
> | *Taxonomia de Soluções com IA — GOIA v1.2* (docx) | Norma: define conceitos, classes, controles e governança | **Prevalece** em conflitos conceituais |
> | *Classificação e inventário de projetos GOIA v12* (xlsm) | Implementação de referência: fórmulas, ordem de cálculo, campos do inventário e da interface | **Prevalece** em ordem de cálculo, formato de campos e modelo de dados, desde que não contradiga a norma |
>
> Marcadores usados nas regras:
> - `[DOC]` está explícito na norma (docx).
> - `[XLS]` está explícito nas fórmulas ou nos textos da planilha.
> - `[DOC+XLS]` está nas duas fontes e elas concordam.
> - `[DERIVADA]` foi inferida por coerência. Implemente como **parâmetro configurável** (liga/desliga).
> - `[CONFLITO-xx]` as fontes divergem. Implemente o comportamento indicado na seção 13, deixe-o configurável e mostre-o na tela de administração.
>
> Toda regra tem ID (`RN-xxx`). Use esses IDs em código, testes e mensagens de validação.
> Idioma da interface: **português (Brasil)**. Contexto: banco regional, ambiente regulado, auditoria e segregação de funções.

---

## 1. Contexto e objetivo

| Item | Definição |
|---|---|
| Objetivo | Padronizar como a GOIA nomeia e classifica soluções com IA e vincular cada classe a controles mínimos obrigatórios. |
| Usuário principal | Product Owner (PO) de soluções de IA, inicialmente da GOIA. |
| Momentos de uso | Abertura da demanda; revisão de arquitetura; toda mudança relevante de escopo. |
| Artefatos do sistema | **Ficha** (classificação individual) → **Inventário** (visão de portfólio) → **Referência** (tabelas parametrizáveis) → **Listas** (domínios dos eixos). |

- `RN-001 [DOC]` A classe **nunca** é escolhida pelo nome da solução. Ela vem das respostas aos eixos. O sistema **não permite** escolher a classe manualmente: ela é **sempre calculada**.
- `RN-002 [DOC]` A pergunta estruturante é: *quem controla o fluxo — o código escrito pela equipe ou o modelo em tempo de execução?*
- `RN-003 [DOC]` Fora do escopo: análise de risco regulatório, classificação de dados e parecer de segurança.
- `RN-004 [DOC]` Fora do escopo: níveis de autonomia de agentes (L1, L2, L3…).
- `RN-005 [DOC]` Escalas externas de autonomia não podem ser exibidas isoladamente. Se houver mapeamento, ele exige fonte explícita e correspondência com os eixos.

### 1.1 Princípios (usar como ajuda contextual)

- `RN-006 [DOC]` Quantidade de IA não gera agência: várias chamadas de LLM em sequência fixa continuam sendo workflow.
- `RN-007 [DOC]` Modelo mais sofisticado não gera agência e não muda a classe.
- `RN-008 [DOC]` O nome do produto não gera agência: “agentes” low-code são classificados pelos eixos.
- `RN-009 [DOC]` Usar ferramenta não é, por si só, ser agente.
- `RN-010 [DOC]` A palavra “agente” é reservada às classes **C4** e **C5**.
- `RN-011 [DERIVADA]` Se o nome ou a descrição de uma solução C0–C3 contiver “agente”, exibir alerta citando RN-010. *(Caso real: “Angico - Agente alertas mainframe” é C2.)*

---

## 2. Eixos de classificação

### 2.1 Regras gerais

- `RN-020 [DOC+XLS]` São seis eixos principais (N, F, A, E, P, H), mais o subeixo NC e o eixo complementar D.
- `RN-021 [DOC+XLS]` Cada eixo aceita **um único nível** (lista suspensa ou radio button).
- `RN-022 [DOC]` Na dúvida entre dois níveis, registra-se o **mais alto**, com justificativa obrigatória.
- `RN-023 [XLS]` Ao selecionar um nível, a tela mostra automaticamente o **significado operacional curto** (tabela Listas, seção 2.10).
- `RN-024 [DOC+XLS]` Cada eixo tem campo de **justificativa objetiva do PO**. `[DERIVADA]` Tornar obrigatório.
- `RN-025 [XLS]` **Eixos mínimos para calcular o resultado:** N, F, A, E e H. Se algum faltar, a classe fica como “— preencha os eixos —” e os campos de resultado ficam vazios.
- `RN-026 [DERIVADA]` P e NC são obrigatórios para **salvar ou submeter** a ficha, mas não para calcular a classe. NC tem padrão NC0.
- `RN-027 [DOC]` Ordem de rigor de H: **H0 (mais rigoroso) > H1 > H2**.

### 2.2 Eixo N — Natureza da inteligência (nível mais alto presente)

| Código | Nível | Significado curto (UI) | Definição operacional (ajuda) |
|---|---|---|---|
| N0 | Determinística | Regras, SQL, heurística. Sem modelo treinado. | Mesma entrada, sempre a mesma saída. |
| N1 | Preditiva (ML) | Modelo treinado gerando escore, classe ou ranking. | Saída auditável e reproduzível com o mesmo artefato. |
| N2 | Generativa | LLM/SLM gerando texto, síntese ou extração. | Não determinística; exige avaliação por amostra. |
| N3 | Generativa com ferramentas | LLM seleciona e invoca ferramentas. | O resultado da ferramenta realimenta o raciocínio. |

### 2.3 Subeixo NC — Composição

| Código | Significado curto | Pré-condição |
|---|---|---|
| NC0 | Componente único — apenas um tipo de inteligência na solução. | — |
| NC1 | Híbrida ML + generativa — modelo preditivo e LLM na mesma solução. | `RN-031 [DOC+XLS]` N ∈ {N2, N3} |
| NC2 | Múltiplos preditivos — dois ou mais modelos de ML, sem generativa. | `RN-032 [DOC+XLS]` N = N1 |

- `RN-033 [DOC]` NC **nunca altera a classe**.
- `RN-034 [DOC]` NC ≠ NC0 ⇒ controles de C1 passam a ser **cumulativos** (seção 6.3).
- `RN-035 [DOC]` NC1 vale só quando os componentes estão **no mesmo ciclo de entrega**. Componentes com ciclo próprio ⇒ fichas próprias, registradas como dependências.
- `RN-036 [XLS]` Texto de ajuda: *“Uma solução com escore de ML e parecer por LLM é N2 · NC1: a classe vem de N2, mas os controles de C1 permanecem exigíveis.”*

### 2.4 Eixo F — Controle de fluxo (decisivo)

| Código | Significado curto |
|---|---|
| F0 | Fluxo fixo em código — o modelo nunca escolhe a próxima etapa. |
| F1 | Roteamento pontual — escolha única entre caminhos enumerados. |
| F2 | Laço de decisão — o modelo cicla e decide quando parar. |
| F3 | Delegação entre agentes — agente aciona agente opaco por contrato. |

- `RN-040 [DOC]` Fluxos fixos em Fabric, Data Factory, Power Automate ou Azure Functions são F0, mesmo com várias chamadas de LLM.
- `RN-041 [DOC]` Mandar o modelo “decidir” no prompt não gera F2 se a execução não mudar e não houver laço.

### 2.5 Eixo A — Espaço de ações

| Código | Significado curto |
|---|---|
| A0 | Sem ação externa — apenas lê dados e produz saída. |
| A1 | Catálogo fechado — ferramentas fixas e versionadas. |
| A2 | Catálogo dinâmico — ferramentas descobertas em execução (registro, diretório, MCP). |

- `RN-045 [DOC]` A1 exige lista versionada de ferramentas declarada na revisão de arquitetura. Ferramenta nova ⇒ nova versão.

### 2.6 Eixo E — Efeito sobre o mundo

| Código | Significado curto |
|---|---|
| E0 | Assistiva — produz informação para consumo humano. |
| E1 | Executora reversível — grava em sistema, possível desfazer. |
| E2 | Executora irreversível ou externa — efeito sobre cliente, dinheiro ou registro (inclui comunicação externa). |

- `RN-050 [DOC]` Apenas consultar não reduz a classe; reduz E e, portanto, a criticidade.

### 2.7 Eixo P — Persistência de estado

| Código | Significado curto |
|---|---|
| P0 | Sem estado — execuções independentes. |
| P1 | Estado de sessão — contexto descartado ao final. |
| P2 | Memória persistente — retém e reutiliza entre execuções. |

- `RN-060 [DOC]` P2 exige política de retenção, de expurgo e de rastreio de dado pessoal. Os três campos são obrigatórios quando P = P2.

### 2.8 Eixo H — Supervisão humana

| Código | Significado curto |
|---|---|
| H0 | Humano no laço — aprovação antes de qualquer efeito. |
| H1 | Humano sobre o laço — conclui sozinha, monitorada por exceção. |
| H2 | Humano fora do laço — sem supervisão corrente, só revisão posterior. |

- `RN-070` Regras de admissibilidade de H: ver seção 6.2 e `[CONFLITO-03]`.

### 2.9 Eixo D — Dependência de plataforma (lock-in)

- `RN-080 [DOC+XLS]` D **não altera a classe nem a assinatura**.
- `RN-081 [DOC+XLS]` D = nível do **componente mais dependente no caminho crítico**. Componentes acessórios (log, notificação) não definem D, mas aparecem no inventário.
- `RN-082 [DOC]` A linguagem não define portabilidade: Python que chama serviço proprietário herda a dependência do serviço.
- `RN-083 [DOC+XLS]` Artefato não exportável ⇒ D3, mesmo com o resto portável. Exemplo da planilha: *Python em Azure Functions chamando modelo customizado do Document Intelligence = D3, por causa do modelo.*
- `RN-084 [DOC]` D não é juízo de valor: D2 e D3 não aparecem como erro.

**Pergunta-guia de D para o wizard** `[XLS]` — *“Se a assinatura fosse desligada amanhã, o que seria preciso fazer para a solução voltar a funcionar em outro ambiente?”*

| Resposta | Nível |
|---|---|
| Subir a mesma imagem em outro lugar e trocar endpoints e credenciais | D0 |
| Reescrever a entrada e a saída (gatilhos, bindings, notebookutils), mantendo a lógica | D1 |
| Trocar um serviço por outro equivalente (OCR, LLM, busca) e revalidar a qualidade | D2 |
| Reconstruir, porque algo essencial não pode ser levado | D3 |

**Catálogo de exemplos de D** `[DOC+XLS]` (base para sugestão automática por componente):

| Nível | Exemplos típicos |
|---|---|
| D0 | Python (FastAPI/Flask) em contêiner; bibliotecas abertas (pypdf, docling, Tesseract); LLM via SDK compatível com OpenAI e endpoint parametrizado `[CONFLITO-06]` |
| D1 | Azure Functions com triggers e bindings; notebook Fabric com notebookutils e caminhos de Lakehouse; cliente de LLM obtido via synapse.ml |
| D2 | Document Intelligence (modelos pré-construídos e Layout); Azure OpenAI; Azure AI Search; endpoint de LLM nativo do Fabric |
| D3 | Copilot Studio; **Power Automate no caminho crítico**; modelo customizado treinado no Document Intelligence; agentes nativos de plataforma |

### 2.10 Tabela de domínio (Listas)

`RN-090 [XLS]` Os domínios dos eixos, os significados curtos e os valores Sim/Não ficam numa **tabela parametrizável** (equivalente à aba Listas), editável apenas pelo administrador e versionada junto com a taxonomia.

---

## 3. Classes GOIA

### 3.1 Tabela de referência (parametrizável — equivalente à aba Referência)

| Classe | Denominação oficial | Denominação externa autorizada | Assinatura típica | Regime de avaliação | Observabilidade mínima | Guardrail mínimo |
|---|---|---|---|---|---|---|
| C0 | Automação determinística | Automação de processo `[CONFLITO-05]` | N0·F0 | Teste funcional por caso | Log de execução | Não aplicável (fora do inventário de IA) |
| C1 | Automação com modelo preditivo embarcado | Automação com modelo preditivo | N1·F0 | Métricas de modelo e monitoramento de drift | Log de escore e versão do modelo | Limite de escore e fallback para regra |
| C2 | Automação com IA generativa embarcada | Automação com IA generativa embarcada | N2·F0·A0 | Avaliação por amostra com critério escrito (e revisão humana documentada `[DOC]`) | Prompt, resposta, modelo, tokens e custo por execução | Timeout, limite de tokens, controle de conteúdo, ancoragem em fonte |
| C3 | Automação/Workflow com roteamento por modelo `[CONFLITO-05]` | Automação com triagem inteligente `[CONFLITO-05]` | N2 ou N3 · F1 · A1 | Matriz de acerto de roteamento por caminho | Rastro do caminho escolhido e da justificativa | Caminho padrão seguro sob baixa confiança + teto de consumo |
| C4 | Agente de autonomia limitada | Agente com autonomia limitada e supervisão | N3·F2·A1 | Avaliação ponta a ponta por cenário, incluindo adversariais | Traço completo de passos, ferramentas e decisões | Orçamento de passos, tempo e custo; disjuntor por laço; identidade própria (e menor privilégio `[DOC]`) |
| C5 | Sistema multiagente | Sistema multiagente supervisionado | N3·F3·A1 ou A2 | Tudo de C4 + teste de contrato entre agentes | Correlação de traço entre agentes | Cota por agente e limite de profundidade de delegação |

- `RN-100 [DOC]` Só a nomenclatura oficial pode ser usada em documentação, backlog, slides e inventário.
- `RN-101 [DOC]` Nas assinaturas típicas de C3 e C5, o `+` do documento significa **“ou”**, não composição.

### 3.2 Termos a evitar na comunicação externa `[DOC]`

| Classe | Evitar |
|---|---|
| C0 | “Automação sem IA embarcada” `[CONFLITO-05]` |
| C1 | “IA que decide”, “agente de score” |
| C2 | “Agente que gera parecer” |
| C3 | “Agente autônomo” |
| C4 | “IA autônoma” sem qualificar a barreira humana |
| C5 | “IA que opera sozinha o processo” |

### 3.3 Algoritmo de cálculo da classe (ordem oficial da planilha)

`RN-110 [XLS]` A avaliação segue **esta ordem exata** (a primeira condição verdadeira define a classe):

```text
função calcularClasse(N, F, A, E, H):
    se algum de {N, F, A, E, H} vazio: retornar "— preencha os eixos —"   # RN-025
    se F == F3:  retornar C5
    se F == F2:  retornar C4
    se N == N0:  retornar C0
    se F == F1:  retornar C3
    se N == N1:  retornar C1     # aqui F é necessariamente F0
    retornar C2                  # N2 ou N3 com F0
```

Consequências que o sistema precisa conhecer:
- `RN-111 [XLS]` F prevalece sobre N: havendo laço (F2), a classe é no mínimo C4.
- `RN-112 [XLS]` **N1 com F1 ⇒ C3; N1 com F2 ⇒ C4.** Isso resolve a lacuna da Rev. 1 (antes, “N1 com F ≠ F0 sem classe”). Ver `[CONFLITO-01]`.
- `RN-113 [XLS]` **N3 com F0 ⇒ C2.** O LLM pode invocar ferramenta em etapa fixa sem virar C3.
- `RN-114 [DERIVADA]` A ordem permite combinações sem sentido (ex.: N0 + F2 ⇒ C4). Bloqueie com RN-123 e RN-124 **antes** do cálculo.

### 3.4 Regras de desempate `[DOC]`

- `RN-115` Várias chamadas de LLM em sequência fixa continuam sendo **C2**.
- `RN-116` Convivência de tipos de IA **não eleva a classe**.
- `RN-117` Em solução híbrida de arquitetura, vale a classe do **componente mais alto**, e cada componente com ciclo próprio tem ficha própria. Exemplo: um pipeline C2 que chama um microsserviço C1 fica registrado como **C2 com dependência C1**.
- `RN-118` A plataforma não define a classe.
- `RN-119` Mudança de eixo exige reclassificação (seção 9).

### 3.5 Validações de coerência (campo “Coerência da classificação”)

`RN-120 [XLS]` O campo de coerência mostra **“OK”** ou **“AJUSTAR — <motivo>”** em vermelho. A ordem de avaliação é a da planilha, e a primeira regra violada define a mensagem. `[DERIVADA]` O sistema web deve **listar todas as violações**, não só a primeira.

| ID | Condição de erro | Mensagem | Fonte | Efeito |
|---|---|---|---|---|
| RN-121 | NC1 e N ∈ {N0, N1} | AJUSTAR — composição híbrida exige N2 ou N3 no eixo N | DOC+XLS | Bloqueia submissão |
| RN-122 | NC2 e N ≠ N1 | AJUSTAR — NC2 pressupõe N1 como nível mais alto | DOC+XLS | Bloqueia submissão |
| RN-123 | N0 e NC ≠ NC0 | AJUSTAR — solução determinística não tem composição | DERIVADA | Bloqueia submissão |
| RN-124 | N0 e F ≠ F0 | AJUSTAR — sem modelo não há decisão de fluxo | DERIVADA | Bloqueia submissão |
| RN-125 | E ∈ {E1, E2} e H ≠ H0 | AJUSTAR — supervisão declarada abaixo do mínimo exigível | XLS | Bloqueia promoção |
| RN-126 | H2 e E ≠ E0 | AJUSTAR — supervisão declarada abaixo do mínimo exigível | XLS | Bloqueia promoção |
| RN-127 | F ∈ {F2, F3} e N ≠ N3 | Alerta — assinatura atípica para agente | DERIVADA | Alerta + justificativa |
| RN-128 | H declarado menos rigoroso que a supervisão mínima calculada | Ver `[CONFLITO-03]` | DOC | Configurável |
| RN-129 | A diferente da assinatura típica (ex.: C2 com A1) | Informativo | DERIVADA | Só alerta |

`RN-130 [XLS]` Texto de orientação do alerta: *“Ou a arquitetura muda, ou a classificação está incorreta.”*

### 3.6 Assinatura

- `RN-140 [DOC]` Formato: `Classe · N·F·A·E·P·H`. O eixo D **não** entra na assinatura.
- `RN-141 [DOC+XLS]` Composição: NC1 ⇒ `N2+N1` ou `N3+N1`.
- `RN-142` Formato canônico no sistema `[CONFLITO-02]`: `C2 · N2+N1·F0·A0·E0·P0·H0`.
- `RN-143 [DERIVADA]` NC2 ⇒ `N1+N1` (a planilha gera `N1+`, que está incompleto).
- `RN-144` A assinatura é **sempre gerada pelo sistema**, nunca digitada, e é a mesma na ficha e no inventário.

```text
função montarAssinatura(classe, N, NC, F, A, E, P, H):
    n = N
    se NC == NC1: n = N + "+N1"
    se NC == NC2: n = "N1+N1"
    retornar f"{classe} · {n}·{F}·{A}·{E}·{P}·{H}"
```

---

## 4. Árvore de decisão (wizard do PO)

`RN-150 [DOC]` Nove perguntas. As sete primeiras definem a classe; a 8 define E, G e supervisão; a 9 define D.

| # | Pergunta | Encaminhamento | Eixos preenchidos |
|---|---|---|---|
| 1 | A solução usa modelo treinado ou modelo de linguagem? | Não → C0, fim | N0, NC0, F0 |
| 2 | Há mais de um tipo de inteligência? | Sim → NC1 ou NC2 | NC |
| 3 | Usa apenas modelo preditivo, sem LLM? | Sim → N1; seguir para a 4 `[XLS: N1 pode ter F1/F2]` | N1 |
| 4 | O modelo escolhe, em tempo de execução, a próxima etapa? | Não → F0 (C1 se N1; C2 se N2/N3), ir para a 8 | F |
| 5 | A escolha ocorre uma única vez, entre caminhos enumerados? | Sim → F1 (C3) | F1 |
| 6 | O modelo opera em ciclo e decide quando encerrar? | Sim → F2 (C4) | F2 |
| 7 | Um agente aciona outro agente por contrato publicado e opaco? | Sim → F3 (C5) | F3 |
| 8 | Qual o efeito da saída: informação, gravação reversível ou efeito externo? | Define E, G e supervisão mínima | E |
| 9 | Pergunta-guia de D (seção 2.9) | Define D, ação exigida e estratégia de saída | D |

- `RN-151 [DERIVADA]` Faça as perguntas 6 e 7 sempre que a 5 for “Não” e aplique o F mais alto (coerente com a ordem de RN-110). Sem resposta positiva, aplique RN-022 e envie para revisão de arquitetura.
- `RN-152 [DERIVADA]` O wizard **pré-preenche** a ficha. Se o PO alterar um eixo contra a resposta do wizard, a justificativa é obrigatória e a ficha recebe marcação para revisão.
- `RN-153` A pergunta 3 foi ajustada em relação à norma (que levava direto a C1) para refletir RN-112. Ver `[CONFLITO-01]`.

### 4.1 Erros comuns (ajuda contextual) `[DOC]`

| Sintoma | Correção |
|---|---|
| “Tem LLM, logo é agente” | Verifique F. Sem decisão de fluxo pelo modelo, é C2. |
| “Tem ML e LLM, não sei classificar” | N = nível mais alto; NC = NC1; a classe vem de N–F e os controles somam. |
| “Como tem ML, classifiquei como C1” | Com LLM, N = N2 ⇒ C2; o regime de C1 entra por acréscimo. |
| “A ferramenta chama de agente” | Classifique pelos eixos. |
| “Várias chamadas de LLM encadeadas” | Encadeamento fixo continua C2. |
| “O prompt manda o modelo decidir” | Só é F2 se a execução mudar e houver laço. |
| “O agente só consulta” | Consultar reduz E, não a classe. |
| “É tudo Python, então é portável” | Python herda a dependência dos serviços que chama. |

---

## 5. Grau de criticidade

- `RN-200 [DOC]` A classe define o regime de engenharia; a criticidade define a intensidade do controle. As duas leituras são obrigatórias.

| Grau | Condição | Consequência `[DOC]` |
|---|---|---|
| G1 — Baixo | E0 e dado não sensível | Aprovação no próprio time; avaliação por amostra na homologação. |
| G2 — Médio | E1, ou E0 com dado pessoal/sigiloso | Revisão de arquitetura formal; avaliação contínua por amostragem em produção. |
| G3 — Alto | E2, ou efeito direto sobre cliente, crédito, fraude ou obrigação regulatória | Parecer de governança e segurança antes da produção; barreira humana obrigatória; trilha completa de decisão. |

```text
função calcularGrau(E, dadoSensivel, dominioSensivel):     # dadoSensivel = campo "Envolve dado pessoal ou sigiloso?"
    se E == E2:                                  retornar G3   # [XLS]
    se dominioSensivel != vazio:                 retornar G3   # [DOC] — campo ausente na planilha
    se E == E1:                                  retornar G2   # [XLS]
    se dadoSensivel == "Sim":                    retornar G2   # [XLS]
    retornar G1
```

- `RN-201 [DOC]` Crie o campo **“Efeito direto em domínio sensível”** (multiseleção: cliente, crédito, fraude, obrigação regulatória). A planilha não tem esse campo e, por isso, nunca chega a G3 sem E2 `[CONFLITO-04]`.
- `RN-202 [DOC]` O **volume** é citado como fator de criticidade, mas sem regra operacional. Use o campo de inventário “média de processamentos por dia” como informativo, fora do cálculo.

---

## 6. Controles

### 6.1 Controles por classe

- `RN-210 [DOC]` Os controles são exigidos na **passagem para produção** e são **cumulativos** na cadeia C2 → C3 → C4 → C5.
- `RN-211 [DERIVADA]` C1 não entra na cadeia; seus controles só se somam via NC (6.3).
- `RN-212 [XLS]` C0 tem controles próprios (teste funcional por caso, log de execução), mas fica **fora do inventário de IA**.
- `RN-213 [XLS]` O resultado da ficha mostra, para a classe calculada: regime de avaliação, observabilidade mínima e guardrail mínimo (tabela 3.1).

### 6.2 Supervisão mínima exigida

`RN-220 [XLS]` Regra implementada na planilha (válida para todas as classes):

```text
função supervisaoMinima_XLS(E):
    se E in {E1, E2}: retornar H0 — humano no laço
    retornar H1 — humano sobre o laço
```

`RN-221 [DOC]` Regra da norma, por classe: C1 → H1; C2 → H0 se E1/E2, H1 se E0; C3 → conforme E; C4 → H0 em toda ação E1/E2; C5 → H0 + aprovação formal; G3 → barreira humana obrigatória.

`RN-222` Regra consolidada a implementar (atende às duas fontes):

```text
função supervisaoMinima(classe, E, grau):
    se classe == C0:                        retornar sem_exigencia
    se classe == C5:                        retornar H0 (+ aprovação formal)
    se grau == G3 ou E in {E1, E2}:         retornar H0
    retornar H1
```

`RN-223` Para E0 com H2, ver `[CONFLITO-03]`.

### 6.3 Regime cumulativo por composição `[DOC+XLS]`

| NC | Texto exibido no resultado |
|---|---|
| NC0 | Não aplicável — componente único |
| NC1 | SIM — acrescentar aos controles da classe o regime de C1: métricas de modelo, monitoramento de drift e versionamento do artefato preditivo. Avaliação em duas frentes independentes (acurácia do preditivo e aderência do texto gerado). |
| NC2 | SIM — regime de C1 por modelo, com versionamento independente de cada artefato e monitoramento de drift separado. |

### 6.4 Teto de consumo `[DOC+XLS]`

- `RN-230` Classe ∈ {C3, C4, C5} ⇒ “SIM — declarar teto e alerta antes da produção”. Caso contrário, “Não obrigatório”.
- `RN-231 [DERIVADA]` Quando obrigatório, o sistema exige o **valor do teto** e a **configuração do alerta de estouro** (a planilha só sinaliza a obrigatoriedade).

### 6.5 Aprovação de comitê `[XLS]`

- `RN-240` Classe = C5 **ou** grau = G3 ⇒ “SIM”. Caso contrário, “Não — revisão de arquitetura basta”.
- `RN-241 [DOC]` Correspondência com a norma: G3 exige parecer de governança e segurança; C5 exige aprovação “em outra esfera”. `[DERIVADA]` Instância aprovadora configurável.

### 6.6 Eixo D — ação exigida e estratégia de saída `[DOC+XLS]`

| D | Denominação | Ação exigida | Estratégia de saída obrigatória? |
|---|---|---|---|
| D0 | Portável | Nenhuma ação adicional. Manter a lógica livre de SDK de plataforma. | Não |
| D1 | Acoplamento de hospedagem | Isolar a borda: lógica sem SDK de plataforma; gatilhos, bindings e I/O em camada de adaptação documentada. | Não |
| D2 | Serviço gerenciado substituível | Adaptador com interface própria; alternativa de mercado identificada; conjunto de avaliação versionado para revalidar a qualidade após a troca. | Só se G3 |
| D3 | Dependência estrutural | Estratégia de saída documentada (o que é reconstruído e esforço estimado); exportação periódica do reaproveitável (dados rotulados, prompts, regras); aceite formal do risco pelo dono. | Sim |

```text
função estrategiaSaidaObrigatoria(D, grau):
    retornar D == D3 ou (D == D2 e grau == G3)
# Texto quando SIM [XLS]: "SIM — documentar estratégia de saída e obter aceite formal do risco pelo dono da solução"
```

### 6.7 Checklist consolidado (saída do sistema)

```text
checklist = controlesClasse(classe, cumulativo RN-210)
          + regimeComposicao(NC)
          + consequenciasGrau(G)
          + acaoD(D) + estrategiaSaida(se obrigatória)
          + tetoConsumo e alerta (se classe ≥ C3)
          + políticas P2 (se P == P2)
          + lista versionada de ferramentas (se A == A1)
          + aprovação de comitê (se C5 ou G3)
          + aprovação formal (se H == H2)
```

Cada item tem: status (Pendente / Atendido / Não aplicável com justificativa), evidência (link ou anexo), responsável e data. **Promover para produção** fica bloqueado enquanto houver item pendente ou coerência ≠ OK.

---

## 7. Ficha de classificação (modelo funcional)

`RN-300 [DOC]` Uma ficha por solução; componentes com ciclo de vida próprio têm ficha própria.

### 7.1 Identificação

| Campo | Tipo | Obrigatório | Fonte |
|---|---|---|---|
| Nome da solução | texto | Sim | DOC+XLS |
| PO responsável | usuário (diretório corporativo) | Sim | DOC+XLS |
| Área demandante | lista | Sim | DOC+XLS |
| Data da classificação | data (automática) | Sim | DOC+XLS |
| Versão da solução | texto | Sim | DOC+XLS |
| Plataforma de execução | lista controlada | Sim | DOC+XLS |
| Envolve dado pessoal ou sigiloso? | Sim/Não | Sim | DOC+XLS |
| Efeito direto em domínio sensível | multiseleção | Sim | DOC (novo) |

### 7.2 Eixos

N, NC, F, A, E, P, H e D, cada um com: **nível**, **significado (automático)** e **justificativa do PO**.

### 7.3 Resultado (calculado; somente leitura)

| Campo | Regra |
|---|---|
| Classe GOIA | RN-110 |
| Denominação oficial | Tabela 3.1 |
| Assinatura completa | RN-140 a RN-144 |
| Grau de criticidade | Seção 5 |
| Denominação externa autorizada | Tabela 3.1 |
| Supervisão mínima exigida | RN-222 |
| Regime cumulativo por composição | 6.3 |
| Coerência da classificação | 3.5 |
| Teto de consumo obrigatório? | RN-230 |
| Aprovação de comitê? | RN-240 |
| Regime de avaliação exigido | Tabela 3.1 |
| Observabilidade mínima | Tabela 3.1 |
| Guardrail mínimo | Tabela 3.1 |
| Grau de dependência de plataforma | “D — denominação” |
| Ação exigida pela dependência | 6.6 |
| Estratégia de saída obrigatória? | 6.6 |
| Teto de consumo declarado | Informado (obrigatório se ≥ C3) |
| Controles mínimos pendentes | Checklist 6.7 |
| Dependências com assinatura própria | Vínculo a outras fichas |
| Componentes proprietários no caminho crítico | Lista estruturada (seção 8.2) |

### 7.4 Declaração e assinaturas

- `RN-310` Texto da declaração (versão da norma, que inclui NC `[CONFLITO-07]`): *“Declaro que a classificação acima reflete a arquitetura efetivamente implementada e que qualquer alteração nos eixos F, A, E, H ou na composição NC será submetida a reclassificação antes da promoção para produção.”*
- `RN-311 [DOC+XLS]` Assinaturas: PO responsável (nome e data) e Revisão de arquitetura (nome e data).
- `RN-312 [DERIVADA]` Segregação de funções: o revisor não pode ser o PO da ficha.

---

## 8. Inventário (modelo de dados de portfólio)

### 8.1 Regras

- `RN-400 [DOC]` Toda solução em produção aparece no inventário com classe, assinatura, composição, grau e teto de consumo.
- `RN-401 [DOC]` C0 fica fora do inventário de IA (pode aparecer como dependência).
- `RN-402 [XLS]` Na planilha, a ficha é “importada” para o inventário por macro, **copiando valores**. No sistema, **ficha e inventário usam o mesmo registro**: não existe cópia, e os campos de classificação do inventário são **visões** da ficha vigente. *(Motivo: na planilha, a ficha e a linha do inventário do mesmo projeto já divergem em P e em D — ver T-30.)*
- `RN-403 [XLS]` Campos calculados no inventário (classe, assinatura, grau, supervisão mínima, coerência, teto, regime cumulativo, denominação externa, ação D, estratégia de saída) seguem **as mesmas funções** da ficha. A planilha recalcula com fórmulas próprias e mais simples (a assinatura do inventário não mostra o NC); o sistema deve usar **uma única implementação**.
- `RN-404 [DOC]` Histórico imutável de versões, com registro da versão da taxonomia usada na classificação.

### 8.2 Campos de inventário além da ficha `[XLS]`

| Grupo | Campo (coluna da planilha) | Tipo sugerido `[DERIVADA]` |
|---|---|---|
| Arquitetura | Desenho do fluxo da solução (T) | URL (SharePoint) |
| | Canal e entrada (U) | lista múltipla (ex.: e-mail, Teams, push ao endpoint, arquivo, agendamento) + texto livre |
| | Canal de resposta ou output (V) | lista múltipla + texto livre |
| | Tecnologias e métodos (W) | tags (catálogo controlado) |
| | Empacotamento (X) | lista (contêiner, Azure Functions, notebook Fabric, Power Automate, App Service, outro) |
| | Serviços (Y) | tags (catálogo de serviços, com nível D sugerido) |
| | Plataformas (Z) | tags |
| | Nuvem / on-premises (AA) | lista |
| | Componente crítico — que pode dar manutenção (AB) | texto ou vínculo a componente |
| Modelos | Modelos LLM/SLM/VLM utilizados (AC) | lista (catálogo de modelos com versão) |
| | Modelos de ML utilizados (AD) | lista (catálogo de artefatos com versão) |
| Esforço | Tempo de desenvolvimento (AE) | número + unidade (meses) |
| | Equipe alocada (FTE) (AF) | decimal |
| Econômico | Custo médio por processamento (AG) | moeda (R$) |
| | Média de processamentos por dia (AH) | inteiro |
| | Custo do processo sem a solução (AI) | moeda (R$) e periodicidade |
| Ciclo de vida | Status de desenvolvimento (AJ) | lista (ex.: Ideação, Em desenvolvimento, Homologação, Em produção, Descontinuada) |
| Lock-in | D — Dependência de plataforma (AK) | da ficha |
| | Ação exigida (AL) | calculado |
| | Estratégia de saída obrigatória? (AM) | calculado |
| | Componentes proprietários no caminho crítico (AN) | lista estruturada: componente, serviço, nível D, crítico (S/N) |
| | Alternativa / estratégia de saída (AO) | texto + anexo; obrigatório se AM = SIM |

- `RN-410 [DERIVADA]` Ao preencher “Serviços” e “Empacotamento” com o catálogo da seção 2.9, o sistema **sugere D** (máximo entre os componentes marcados como críticos) e alerta se o D declarado for menor que o sugerido.
- `RN-411 [DERIVADA]` Consistência entre campos: modelo listado em “Modelos LLM” ⇒ N ≥ N2; modelo em “Modelos ML” ⇒ NC1/NC2 ou N1; nenhum modelo ⇒ N0.
- `RN-412 [DERIVADA]` Indicadores calculados no painel: custo diário estimado (AG × AH), economia estimada (AI − custo com a solução) e consumo versus teto declarado.

---

## 9. Reclassificação e governança

| ID | Regra | Fonte |
|---|---|---|
| RN-500 | Dona da taxonomia: GOIA. Revisões são discutidas com a GIA antes de entrar em vigor. | DOC |
| RN-501 | Revisão semestral, ou quando uma solução real não couber nas classes. O sistema permite registrar “solução não enquadrável”. | DOC |
| RN-502 | Reclassificação obrigatória quando mudar **F, A, E, H ou NC** `[CONFLITO-07]`. | DOC (XLS omite NC) |
| RN-503 | Trocar o modelo mantendo os eixos não reclassifica. | DOC+XLS |
| RN-504 | Mudança em eixo-gatilho invalida a aprovação vigente e bloqueia a promoção. | DERIVADA |
| RN-505 | Em divergência de classificação, registra-se o nível mais alto em disputa e escala-se para a revisão de arquitetura. | DOC |
| RN-506 | D é reavaliado quando muda um componente crítico ou mudam condições do fornecedor. | DOC |
| RN-507 | Estratégias de saída D3 são revisadas a cada semestre; o sistema gera lembrete. | DOC |
| RN-508 | Mudança em N ou P gera alerta de reavaliação, sem invalidação automática. | DERIVADA |

---

## 10. Interface (convenções herdadas da planilha) `[XLS]`

| Cor | Significado | Uso no sistema |
|---|---|---|
| Amarelo | Entrada do PO | Campos editáveis |
| Verde | Campo calculado | Somente leitura |
| Cinza | Apoio automático | Significado do nível, ajuda contextual |
| Vermelho | Incoerência a tratar | Coerência “AJUSTAR”, regime cumulativo “SIM”, estratégia de saída “SIM” |

- `RN-600 [XLS]` Destaque visual (formatação condicional da planilha) quando: regime cumulativo começa com “SIM”, coerência começa com “AJUSTAR”, ou estratégia de saída começa com “SIM”.
- `RN-601 [DERIVADA]` A ação “Importar ficha” vira **“Submeter para revisão”**; não há cópia de dados.
- `RN-602` Requisito de acessibilidade: não usar a cor como único sinal (incluir ícone e texto).

---

## 11. Casos de teste de aceitação

### 11.1 Arquétipos da norma

| ID | Solução | Entradas | Classe esperada |
|---|---|---|---|
| T-01 | Pipeline com parecer por LLM na etapa final | N2, F0 | C2 |
| T-02 | Escore de ML + parecer por LLM | N2, NC1, F0 | C2, assinatura `N2+N1`, regime C1 = SIM |
| T-03 | Classificador de documentos com roteamento para filas | N2/N3, F1 | C3, teto = SIM |
| T-04 | Antifraude com escore e regra de corte | N1, F0 | C1 |
| T-05 | Propensão com dois modelos preditivos | N1, NC2, F0 | C1, assinatura `N1+N1` |
| T-06 | Busca com resposta gerada e citação | N2, F0, P1 | C2 |
| T-07 | Assistente que decide quais APIs chamar em ciclo | N3, F2, A1, E0 | C4 |
| T-08 | Agente consome contrato de outro agente | N3, F3 | C5, comitê = SIM |
| T-09 | Manipulação de PDFs | N0, F0 | C0, fora do inventário |
| T-10 | PDF via chat, páginas informadas, uma chamada | N3, F1, A1 | C3 + dependência C0 |
| T-11 | PDF via chat, “separe as cláusulas de rescisão” | N3, F2, A1 | C4 |

### 11.2 Regras de cálculo e coerência

| ID | Entrada | Esperado |
|---|---|---|
| T-20 | N1, F1 | C3 (RN-112), com justificativa obrigatória por `[CONFLITO-01]` |
| T-21 | N1, F2 | C4 + alerta RN-127 |
| T-22 | N3, F0 | C2 (RN-113) |
| T-23 | N0, F2 | Bloqueio RN-124 antes do cálculo |
| T-24 | NC1 com N1 | AJUSTAR (RN-121) |
| T-25 | NC2 com N2 | AJUSTAR (RN-122) |
| T-26 | E1, H1 | AJUSTAR (RN-125) |
| T-27 | E1, H2 | AJUSTAR (RN-126) |
| T-28 | E0, sem dado sensível, domínio sensível = crédito | G3; comitê = SIM; supervisão mínima = H0 |
| T-29 | D2 com G3 / D3 com G1 / D2 com G1 | SIM / SIM / Não |
| T-31 | Eixo A vazio | “— preencha os eixos —” |
| T-32 | Troca gpt-x → gpt-y sem mudar eixos | Não reclassifica |
| T-33 | NC0 → NC1 | Reclassificação obrigatória |

### 11.3 Caso real da planilha (regressão)

**T-30 — “Angico - Agente alertas mainframe”** (PO Henrique Oliveira; em produção)

| Item | Ficha | Inventário | Comportamento esperado do sistema |
|---|---|---|---|
| Plataforma | Azure | Fabric/Azure | Valor único (registro único) |
| Eixos | N2·F0·A1·E0·**P0**·H2 | N2·F0·A1·E0·**P1**·H2 | Valor único; divergência impossível |
| D | **D2** | **D1** | Valor único; sugerir D pelo catálogo |
| Classe | C2 | C2 | C2 |
| Coerência | OK | OK | Depende de `[CONFLITO-03]`: H2 com mínimo H1 |
| Nome | contém “Agente” | — | Alerta RN-011 |
| Tecnologias | — | inclui Power Automate | Se estiver no caminho crítico, D sugerido = **D3** (catálogo) → alerta RN-410 |
| Modelos | — | “gpt4 nano” em LLM e em componente crítico | OK; ML vazio coerente com NC0 |

---

## 12. Requisitos funcionais

| ID | Requisito |
|---|---|
| RF-01 | Wizard de 9 perguntas que pré-preenche a ficha. |
| RF-02 | Ficha com validação em tempo real e cálculo automático de todos os campos de resultado (7.3). |
| RF-03 | Registro único ficha/inventário, com campos complementares do inventário (8.2). |
| RF-04 | Checklist de controles com evidências; bloqueio de promoção. |
| RF-05 | Fluxo de aprovação: PO → Revisão de arquitetura → (Comitê, se C5 ou G3). |
| RF-06 | Histórico imutável, trilha de auditoria e detecção de gatilhos de reclassificação. |
| RF-07 | Inventário com filtros (classe, grau, D, status, plataforma, área, PO) e exportação XLSX/PDF. |
| RF-08 | Painel: soluções com coerência AJUSTAR, D3 e estratégias de saída a revisar, soluções ≥ C3 sem teto, custo × economia, soluções não enquadráveis. |
| RF-09 | Catálogos administráveis: domínios dos eixos (Listas), Referência de classes, Referência D, serviços/tecnologias com D sugerido, modelos. |
| RF-10 | Parametrização das regras `[DERIVADA]` e dos `[CONFLITO-xx]`. |
| RF-11 | Importação inicial da planilha xlsm existente (abas Ficha e Inventário), com relatório de divergências. |

### Papéis

| Papel | Permissões |
|---|---|
| PO | Cria e edita fichas próprias; responde ao wizard; assina a declaração. |
| Revisor de arquitetura | Aprova ou devolve fichas; resolve divergências. |
| Comitê / Governança e Segurança | Parecer para G3 e C5. |
| Administrador GOIA | Taxonomia, catálogos e parâmetros. |
| Consulta (GIA, auditoria) | Leitura do inventário e do histórico. |

---

## 13. Conflitos entre as fontes e lacunas remanescentes

| ID | Tema | Norma (docx) | Planilha (xlsm) | Comportamento recomendado (padrão configurável) |
|---|---|---|---|---|
| CONFLITO-01 | N1 com F1/F2 | Árvore: só preditivo ⇒ C1 | Ordem de cálculo ⇒ C3/C4 | Seguir a planilha (RN-112) e exigir justificativa; levar à GOIA para incluir na norma. |
| CONFLITO-02 | Formato da assinatura | `C2 · N2·F0·…` | `C2 - N2-F0-…`; o inventário omite o `+N1` | Formato da norma, com composição sempre visível. |
| CONFLITO-03 | H2 com E0 | Mínimo H1 em C1–C4 (H2 inviável); H2 admissível com E0/E1 + aprovação formal | Mostra mínimo H1, mas aceita H2 com E0 como **OK**; E1 sempre exige H0 | Padrão: H2 permitido só com E0 **e** aprovação formal registrada, tratado como exceção visível. |
| CONFLITO-04 | Gatilhos de G3 | E2 **ou** domínio sensível (cliente, crédito, fraude, regulatório) | Só E2 | Seguir a norma (RN-201). |
| CONFLITO-05 | Nomenclaturas | C3 oficial “Automação/Workflow com roteamento por modelo”; externa “Automação roteada por IA generativa”; C0 externa “Automação determinística de processo” | C3 oficial “Automação com roteamento por modelo”; externa “Automação com triagem inteligente”; C0 externa “Automação de processo” | Tabela 3.1 parametrizável; GOIA decide o texto final. Padrão: externa da planilha (mais recente), oficial da norma. |
| CONFLITO-06 | LLM com endpoint parametrizado | Troca = configuração + revalidação (perfil de D2) | Exemplo de D0 | Padrão: **D2** quando o LLM é serviço gerenciado (Azure OpenAI); D0 só para modelo aberto autoalojado em contêiner. |
| CONFLITO-07 | Gatilhos de reclassificação e declaração | F, A, E, H **e NC** | F, A, E, H | Seguir a norma (incluir NC). |
| CONFLITO-08 | Supervisão mínima de C1 com E1 | C1 → H1 | E1 → H0 em qualquer classe | Seguir a planilha (mais conservadora). |
| L-01 | Formato da assinatura de NC2 | Não definido | Gera `N1+` (incompleto) | `N1+N1`. |
| L-02 | “Aprovação em outra esfera” (C5) | Instância não nomeada | “Comitê” | Instância configurável. |
| L-03 | Volume na criticidade | Citado, sem regra | Campo AH existe | Informativo. |
| L-04 | Termo a evitar para C0 | “Automação sem IA embarcada” (correto factualmente) | — | Manter e marcar para revisão. |
| L-05 | Instruções “Como usar” desatualizadas | — | Dizem que a macro não copia D, mas o código atual copia (coluna AK) | Ignorar; não migrar esse texto. |
