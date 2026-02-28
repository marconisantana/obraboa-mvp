

## Splash Screen e Onboarding

### Resumo

Adicionar uma Splash Screen animada (1.5s com logo centralizado em fundo navy) e um fluxo de Onboarding de 3 passos que aparece apenas na primeira vez, antes de redirecionar para Login/Signup.

---

### 1. Splash Screen (`src/pages/SplashPage.tsx`)

- Tela fullscreen com fundo `#1B3A5C`
- Logo `logo-obraboa-white.svg` centralizado (240px de largura)
- Animacao de fade-in na logo ao montar
- Apos 1.5s, transicao suave (fade-out) para:
  - Se primeiro acesso (sem flag `onboarding_done` no localStorage): vai para `/onboarding`
  - Se ja fez onboarding: vai para `/login`
  - Se ja esta autenticado: vai para `/`
- Rota: `/splash` (sera a rota inicial `/` para usuarios nao autenticados)

### 2. Onboarding (`src/pages/OnboardingPage.tsx`)

- Tela fullscreen com 3 steps, navegacao por botoes "Proximo" / dots indicadores
- **Botao "Pular"** no canto superior direito em todos os steps
- **Step 1** - "Bem-vindo ao ObraBoa": headline grande, subtitulo com tagline, ilustracao com icone de construcao (Lucide icons compostos)
- **Step 2** - "Organize sua obra": 3 cards destacando funcionalidades principais (Cronograma, RDO, Checklists) com icones
- **Step 3** - "Comece agora": CTA grande "Criar conta" que navega para `/signup`, link secundario "Ja tenho conta" para `/login`
- Ao completar ou pular: salva `onboarding_done = true` no localStorage
- Animacoes de transicao entre steps usando Framer Motion (slide horizontal)

### 3. Roteamento

Modificar `src/App.tsx`:
- Adicionar rota `/splash` com `SplashPage`
- Adicionar rota `/onboarding` com `OnboardingPage`
- Alterar `ProtectedRoute` para redirecionar para `/splash` em vez de `/login` quando nao autenticado (splash faz o redirecionamento inteligente)

### 4. Traducoes (i18n)

Adicionar chaves em `pt-BR.json` e `en-US.json`:
```
"onboarding": {
  "skip": "Pular",
  "next": "Proximo",
  "step1Title": "Bem-vindo ao ObraBoa",
  "step1Subtitle": "O assistente completo para gerenciar sua obra do inicio ao fim",
  "step2Title": "Organize sua obra",
  "step2Subtitle": "Tudo que voce precisa em um so lugar",
  "step2Feature1": "Cronograma",
  "step2Feature1Desc": "Planeje etapas e acompanhe o progresso",
  "step2Feature2": "Diario de Obra",
  "step2Feature2Desc": "Registre atividades com fotos diariamente",
  "step2Feature3": "Checklists",
  "step2Feature3Desc": "Controle qualidade e conformidade",
  "step3Title": "Comece agora",
  "step3Subtitle": "Crie sua conta gratuita e comece a organizar suas obras",
  "createAccount": "Criar conta",
  "alreadyHaveAccount": "Ja tenho conta"
}
```

### 5. Arquivos

- **Criar**: `src/pages/SplashPage.tsx`, `src/pages/OnboardingPage.tsx`
- **Modificar**: `src/App.tsx` (rotas), `src/components/ProtectedRoute.tsx` (redirect para /splash), `public/locales/pt-BR.json`, `public/locales/en-US.json`

### Detalhes Tecnicos

- **Persistencia**: `localStorage.getItem('obraboa_onboarding_done')` para controlar se onboarding ja foi visto
- **Animacoes**: Framer Motion `AnimatePresence` + `motion.div` para transicoes entre steps e fade da splash
- **Timer splash**: `setTimeout` de 1500ms + `useNavigate` do react-router
- **Dots indicator**: 3 circulos pequenos abaixo do conteudo, o ativo em cor accent `#F59E0B`

