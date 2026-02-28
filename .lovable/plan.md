

## PlanGate: Controle Inteligente de Plano

### Resumo

Transformar o PlanGate de um componente simples em um sistema completo de controle de acesso por plano. Hoje ele so bloqueia criacao de projeto no plano free. O objetivo e aplicar limites de projetos, membros e features (PDF, modulo financeiro) em todos os pontos relevantes, com mensagens contextuais no bottom sheet.

---

### 1. Expandir store com limites de plano

**`src/stores/useAppStore.ts`**

Adicionar constante `PLAN_LIMITS` com limites por plano e funcao `checkPlanLimit`:

```text
PLAN_LIMITS = {
  free:    { projects: 1, members: 1 },
  basic:   { projects: 3, members: 3 },
  flipper: { projects: 3, members: 5 },
  pro:     { projects: 10, members: 10 },
}
```

Novas funcoes no store:
- `getPlanLimits()` - retorna os limites do plano atual
- `canCreateProject()` - verifica `projects.length < limit`
- `canAddMember(currentMemberCount: number)` - verifica `count < limit`

---

### 2. Criar hook `usePlanGate`

**Novo: `src/hooks/usePlanGate.ts`**

Hook centralizado que encapsula a logica de verificacao e controle do drawer:

```text
usePlanGate() retorna:
  - gateOpen: boolean
  - gateFeature: string | null
  - checkAndGate(feature: 'project' | 'member' | 'pdf_export' | 'financial_module', context?: { memberCount?: number }): boolean
    - Se permitido: retorna true
    - Se bloqueado: abre o drawer com a feature especifica, retorna false
  - closeGate(): void
  - GateDrawer: componente JSX renderizavel (o drawer ja configurado)
```

Isso elimina a necessidade de cada componente gerenciar estado proprio do PlanGate.

---

### 3. Melhorar PlanGateDrawer com mensagens contextuais

**`src/components/profile/PlanGateDrawer.tsx`**

Receber `feature` como prop para mostrar titulo e descricao especificos:
- `project`: "Limite de projetos atingido. Seu plano permite X projeto(s)."
- `member`: "Limite de membros atingido. Seu plano permite X membro(s)."
- `pdf_export`: "Exportacao PDF disponivel a partir do plano Basic."
- `financial_module`: "Modulo financeiro disponivel a partir do plano Flipper."

Mostrar badge do plano atual + botao "Ver planos" que abre o dialog de planos inline (sem sair do contexto).

---

### 4. Integrar nos pontos de enforcement

**Criacao de projetos** (ja parcialmente implementado):
- `src/components/FAB.tsx` - usar `usePlanGate` em vez de logica manual
- `src/components/profile/ProjectListSection.tsx` - idem

**Convite de membros**:
- `src/components/members/MembersSection.tsx` - antes de abrir InviteMemberDialog, verificar `canAddMember(members.length)`
- `src/components/members/InviteMemberDialog.tsx` - validacao redundante antes de gerar link

**Exportacao PDF**:
- `src/components/purchases/PurchaseOrderDetail.tsx` - verificar `canAccessFeature('pdf_export')` antes de gerar PDF
- `src/components/rdo/RdoExportMenu.tsx` - idem para exportacao de RDO (se existir)

---

### 5. Traducoes

Novas chaves em `pt-BR.json` e `en-US.json`:

```text
planGate.projectTitle: "Limite de projetos"
planGate.projectDesc: "Seu plano permite até {{count}} projeto(s). Faça upgrade para criar mais."
planGate.memberTitle: "Limite de membros"  
planGate.memberDesc: "Seu plano permite até {{count}} membro(s) por projeto. Faça upgrade para adicionar mais."
planGate.pdfTitle: "Exportação PDF"
planGate.pdfDesc: "A exportação em PDF está disponível a partir do plano Basic."
planGate.financialTitle: "Módulo Financeiro"
planGate.financialDesc: "O módulo financeiro está disponível a partir do plano Flipper."
planGate.upgrade: "Fazer Upgrade"
planGate.currentPlan: "Plano atual: {{plan}}"
```

---

### Arquivos

**Novo**:
- `src/hooks/usePlanGate.ts`

**Modificados**:
- `src/stores/useAppStore.ts` - PLAN_LIMITS, canCreateProject, canAddMember, getPlanLimits
- `src/components/profile/PlanGateDrawer.tsx` - props feature/featureLimit, mensagens contextuais, dialog de planos inline
- `src/components/FAB.tsx` - usar usePlanGate
- `src/components/profile/ProjectListSection.tsx` - usar usePlanGate
- `src/components/members/MembersSection.tsx` - verificar limite de membros antes de convidar
- `src/components/purchases/PurchaseOrderDetail.tsx` - verificar pdf_export antes de exportar
- `public/locales/pt-BR.json` - novas chaves planGate
- `public/locales/en-US.json` - novas chaves planGate

### Detalhes Tecnicos

- O hook `usePlanGate` usa `useState` interno para `gateOpen` e `gateFeature`, e le `plan`, `projects`, `canAccessFeature` do Zustand store.
- `checkAndGate` e sincrono: verifica o limite e retorna boolean imediatamente. Se falso, seta o estado para abrir o drawer.
- O `GateDrawer` retornado pelo hook e um componente que deve ser renderizado no JSX do componente pai: `{GateDrawer}`. Isso garante que o drawer esta no DOM sem precisar de estado manual.
- Para membros, o count e passado como parametro pois depende de query ao banco (nao esta no store global).
- O dialog de planos e renderizado dentro do proprio drawer (nao navega para outra pagina), mantendo o contexto do usuario.

