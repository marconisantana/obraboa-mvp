

## Refinar Edge Cases

### Visao Geral

Implementar 12 edge cases para tornar o app robusto e resiliente. Alguns ja estao parcialmente cobertos (ex: RDO duplicado ja tem `checkDuplicateDate`). O foco sera em melhorar os existentes e adicionar os que faltam.

---

### 1. RDO duplicado no mesmo dia (Refinar)

**Status atual**: `RdoForm.tsx` ja verifica duplicatas via `checkDuplicateDate` e mostra toast generico.

**Mudanca**: Ao detectar duplicata, mostrar toast com botao de acao "Editar RDO existente" que navega para `/rdo/{id_existente}`. O `checkDuplicateDate` ja retorna o `id` do RDO existente.

**Arquivos**: `src/components/rdo/RdoForm.tsx`

---

### 2. PlanGate para plano free criando 2o projeto

**Mudanca**: Criar componente `PlanGateDrawer` (bottom sheet) que intercepta a criacao de projeto quando `plan === 'free'` e `projects.length >= 1`. O drawer mostra mensagem de upgrade com botao para ver planos.

**Integracao**: Adicionar verificacao no `CreateProjectModal`, `FAB` e `ProjectListSection` antes de abrir o form de criacao.

**Arquivos**:
- Criar `src/components/profile/PlanGateDrawer.tsx`
- Modificar `src/components/profile/CreateProjectModal.tsx`
- Modificar `src/components/FAB.tsx`
- Modificar `src/components/profile/ProjectListSection.tsx`

---

### 3. Cliente tenta editar cronograma (controle por role)

**Mudanca**: Criar hook `useProjectRole` que retorna o role do usuario no projeto ativo. Nas paginas de edicao (Schedule, RDO, Checklists, Purchases, Dossiers, Documents, References), esconder botoes de criacao/edicao/exclusao para roles `client` e `viewer`. Se tentarem acessar via URL direta, mostrar toast informativo.

**Arquivos**:
- Criar `src/hooks/useProjectRole.ts`
- Modificar paginas: `SchedulePage`, `RdoPage`, `ChecklistsPage`, `PurchasesPage`, `DossiersPage`, `DocumentsPage`, `ReferencesPage`

---

### 4. Dossie extrapolado (banner + badge)

**Status atual**: `DossierDetail.tsx` ja mostra banner vermelho para status `exceeded`. `DossierCard.tsx` mostra badge `exceeded`.

**Mudanca**: Adicionar icone `AlertTriangle` no badge do card quando `exceeded` para maior destaque visual. Ja esta funcionando, apenas refinar o visual do badge.

**Arquivos**: `src/components/dossiers/DossierCard.tsx`

---

### 5. Upload falha (retry)

**Mudanca**: Nos componentes de upload (RdoForm, AddReferenceDialog, DocumentsPage), capturar erros de upload e mostrar toast persistente com botao "Tentar novamente". Criar helper `uploadWithRetry` que encapsula a logica de retry.

**Arquivos**:
- Criar `src/lib/uploadWithRetry.ts`
- Modificar `src/components/rdo/RdoForm.tsx` (usar helper)
- Modificar `src/components/references/AddReferenceDialog.tsx`

---

### 6. Convite expirado (pagina amigavel)

**Status atual**: `AcceptInvitePage.tsx` ja mostra mensagem de erro para convites expirados/usados.

**Mudanca**: Melhorar o visual com ilustracao (icone maior), mensagem mais clara e botao "Solicitar novo convite" (que abre WhatsApp/email para o responsavel). Ja esta basicamente implementado, refinar texto e adicionar CTA.

**Arquivos**: `src/pages/AcceptInvitePage.tsx`

---

### 7. Foto de RDO em resolucao alta (comprimir client-side)

**Mudanca**: Criar funcao `compressImage` que usa Canvas API para redimensionar imagens para max 1200px de largura mantendo aspect ratio, com qualidade 0.8. Aplicar antes de cada upload em RdoForm e qualquer outro upload de imagem.

**Arquivos**:
- Criar `src/lib/compressImage.ts`
- Modificar `src/components/rdo/RdoForm.tsx`
- Modificar `src/components/references/AddReferenceDialog.tsx`
- Modificar `src/components/profile/CreateProjectModal.tsx`
- Modificar `src/components/profile/AvatarUpload.tsx`

---

### 8. Formulario longo com sessao expirada (auto-save localStorage)

**Mudanca**: Criar hook `useFormAutoSave` que salva dados do formulario em localStorage a cada 30s. Ao abrir o form, verificar se existe draft salvo e oferecer restaurar. Aplicar em `RdoForm`, `StageForm`, `DossierForm` e `CreateProjectModal`.

**Arquivos**:
- Criar `src/hooks/useFormAutoSave.ts`
- Modificar `src/components/rdo/RdoForm.tsx`
- Modificar `src/components/schedule/StageForm.tsx`
- Modificar `src/components/dossiers/DossierForm.tsx`

---

### 9. Projeto sem etapas (estado vazio com CTA)

**Status atual**: `SchedulePage.tsx` ja mostra estado vazio ilustrado com CTA "Adicionar etapa".

**Mudanca**: Nenhuma necessaria. Ja esta implementado corretamente com icone `CalendarDays`, texto descritivo e botao com `Plus`.

---

### 10. Offline (toast de aviso)

**Mudanca**: Criar componente `OfflineDetector` que escuta `window.addEventListener('online'/'offline')` e mostra toast persistente quando offline. Adicionar no `AppLayout`.

**Arquivos**:
- Criar `src/components/OfflineDetector.tsx`
- Modificar `src/components/AppLayout.tsx`

---

### 11. PDF com muitos itens (paginacao)

**Status atual**: `RdoPrintView.tsx` usa CSS `@media print` e nao usa jsPDF.

**Mudanca**: Adicionar CSS `page-break-inside: avoid` nas rows da tabela e `page-break-before: auto` nos blocos de fotos para evitar corte. Para a tabela de equipe muito longa, adicionar `break-inside: avoid-column` por grupo. Nao e necessario jsPDF pois o app usa `window.print()`.

**Arquivos**: `src/components/rdo/RdoPrintView.tsx`

---

### 12. URL de imagem externa invalida (caderno de refs)

**Status atual**: `AddReferenceDialog.tsx` ja valida URLs de imagem usando `new Image()` e mostra erro se invalida. O botao de salvar fica desabilitado quando `urlValid !== true`.

**Mudanca**: Ja esta implementado. Apenas garantir que a mensagem de erro inclua orientacao clara. Nenhuma mudanca necessaria.

---

### Resumo de Arquivos

**Novos arquivos (4)**:
- `src/components/profile/PlanGateDrawer.tsx`
- `src/hooks/useProjectRole.ts`
- `src/lib/compressImage.ts`
- `src/hooks/useFormAutoSave.ts`
- `src/components/OfflineDetector.tsx`
- `src/lib/uploadWithRetry.ts`

**Arquivos modificados**:
- `src/components/rdo/RdoForm.tsx` - duplicata com CTA, comprimir imagem, auto-save
- `src/components/FAB.tsx` - plan gate
- `src/components/profile/CreateProjectModal.tsx` - plan gate, comprimir imagem
- `src/components/profile/ProjectListSection.tsx` - plan gate
- `src/components/dossiers/DossierCard.tsx` - badge exceeded visual
- `src/components/references/AddReferenceDialog.tsx` - comprimir imagem
- `src/components/profile/AvatarUpload.tsx` - comprimir imagem
- `src/components/rdo/RdoPrintView.tsx` - page-break CSS
- `src/components/AppLayout.tsx` - OfflineDetector
- `src/pages/AcceptInvitePage.tsx` - refinar visual
- `src/pages/SchedulePage.tsx` - role-based visibility
- `src/pages/RdoPage.tsx` - role-based visibility
- `src/pages/ChecklistsPage.tsx` - role-based visibility
- `src/pages/PurchasesPage.tsx` - role-based visibility
- `src/pages/DossiersPage.tsx` - role-based visibility
- `src/pages/DocumentsPage.tsx` - role-based visibility
- `src/pages/ReferencesPage.tsx` - role-based visibility
- `public/locales/pt-BR.json` - novas chaves
- `public/locales/en-US.json` - novas chaves

### Detalhes Tecnicos

**useProjectRole hook**: Consulta `get_project_role` via RPC ou faz select em `project_members` com join em `profiles` para obter o role do usuario autenticado no projeto ativo. Retorna `{ role, canEdit, isOwner, isLoading }` onde `canEdit = role === 'owner' || role === 'professional'`.

**compressImage**: Usa `HTMLCanvasElement` e `canvas.toBlob()` para redimensionar. Aceita `maxWidth` (default 1200) e `quality` (default 0.8). Retorna `Promise<File>`.

**useFormAutoSave**: Recebe uma `key` unica e os dados do form. Usa `useEffect` com `setInterval(30000)` para salvar em localStorage. Expoe `hasDraft`, `restoreDraft()`, `clearDraft()`.

**PlanGateDrawer**: Bottom sheet com icone Crown, titulo "Upgrade necessario", descricao do limite, e botao que abre o dialog de planos do `PlanCard`.

**OfflineDetector**: Usa `navigator.onLine` + event listeners. Mostra toast com `duration: Infinity` quando offline, dismissa quando volta online.

**uploadWithRetry**: Wrapper que tenta upload ate 2x com delay de 1s. Se falhar, lanca erro com mensagem amigavel. Toast persistente com botao de retry manual.
