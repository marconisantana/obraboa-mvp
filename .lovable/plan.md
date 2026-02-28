
## Modulo Checklists

### Resumo

Criar o modulo completo de Checklists inspirado no Checklist Facil, com banco de dados (3 tabelas + storage), listagem com progresso, templates pre-definidos, tela de checklist com itens interativos (checkbox otimista, reordenacao, upload de foto de comprovacao), e barra de progresso no topo.

---

### 1. Banco de dados

**Tabela `checklists`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| project_id | uuid | FK -> projects.id CASCADE | No |
| user_id | uuid | auth.uid() | No |
| name | text | - | No |
| status | text | 'in_progress' | No |
| responsible_name | text | '' | Yes |
| due_date | date | null | Yes |
| created_at | timestamptz | now() | No |
| updated_at | timestamptz | now() | No |

**Tabela `checklist_items`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| checklist_id | uuid | FK -> checklists.id CASCADE | No |
| text | text | - | No |
| checked | boolean | false | No |
| responsible_name | text | '' | Yes |
| due_date | date | null | Yes |
| sort_order | integer | 0 | No |
| created_at | timestamptz | now() | No |

**Tabela `checklist_item_photos`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| item_id | uuid | FK -> checklist_items.id CASCADE | No |
| storage_path | text | - | No |
| created_at | timestamptz | now() | No |

**Storage bucket**: `checklist-photos` (public).

**RLS**: Todas as tabelas com policies baseadas em `EXISTS (SELECT 1 FROM projects WHERE projects.id = checklists.project_id AND projects.owner_id = auth.uid())` (com joins para item_photos via checklist_items -> checklists).

**Trigger** `update_updated_at_column` na tabela `checklists`.

### 2. Traducoes (i18n)

Novas chaves em `pt-BR.json` e `en-US.json`:

```text
"checklist": {
  "title": "Checklists",
  "new": "Novo Checklist",
  "edit": "Editar Checklist",
  "name": "Nome do checklist",
  "responsible": "Responsavel",
  "dueDate": "Prazo",
  "noChecklists": "Nenhum checklist cadastrado",
  "noChecklistsDesc": "Crie o primeiro checklist do projeto",
  "templates": "Criar a partir de template",
  "templateInspection": "Vistoria de recebimento",
  "templateCleaning": "Limpeza pos obra",
  "templateHandover": "Entrega de chaves",
  "templateBlank": "Em branco",
  "addItem": "Adicionar item",
  "itemPlaceholder": "Descreva o item...",
  "progressLabel": "{checked} de {total} itens concluidos ({percent}%)",
  "in_progress": "Em andamento",
  "completed": "Concluido",
  "delayed": "Atrasado",
  "uploadProof": "Foto de comprovacao",
  "deleteConfirm": "Tem certeza que deseja excluir este checklist?",
  "markComplete": "Marcar como concluido"
}
```

### 3. Templates pre-definidos

Definidos como constante no frontend (sem banco). Cada template e um array de strings que sera usado para criar os itens iniciais:

- **Vistoria de recebimento**: "Verificar paredes e revestimentos", "Verificar piso", "Verificar esquadrias", "Verificar instalacoes eletricas", "Verificar instalacoes hidraulicas", "Verificar pintura", "Verificar louças e metais", "Verificar portas e fechaduras"
- **Limpeza pos obra**: "Remover entulhos", "Limpeza grossa de pisos", "Limpeza de vidros", "Limpeza de bancadas", "Limpeza de louças sanitarias", "Aspirar todos os ambientes", "Limpeza final de pisos"
- **Entrega de chaves**: "Testar todas as chaves", "Verificar funcionamento de fechaduras", "Testar interfone", "Verificar medidores (agua, luz, gas)", "Assinar termo de entrega", "Entregar manual do proprietario"
- **Em branco**: []

### 4. Hook `useChecklists`

Criar `src/hooks/useChecklists.ts`:
- React Query + Supabase CRUD para `checklists` e `checklist_items`
- `fetchChecklists(projectId)`: lista com contagem de itens total/checked
- `fetchChecklistDetail(checklistId)`: checklist com todos os itens e fotos
- `createChecklist`, `updateChecklist`, `deleteChecklist`
- `toggleItem(itemId, checked)`: atualiza otimisticamente no cache do React Query antes de salvar
- `addItem`, `updateItem`, `deleteItem`, `reorderItems`
- `uploadItemPhoto`, `deleteItemPhoto`

### 5. Componentes

**`src/components/checklist/ChecklistCard.tsx`** - Card para a listagem:
- Nome do checklist, badge de status colorido (azul/verde/vermelho)
- Barra de progresso com "X/Y itens"
- Data e responsavel
- Click navega para detalhe

**`src/components/checklist/ChecklistForm.tsx`** - Dialog para criar/editar:
- Nome, responsavel, prazo
- Selecao de template (grid de 4 opcoes) - apenas na criacao
- Validacao com zod

**`src/components/checklist/ChecklistDetail.tsx`** - Tela do checklist:
- Barra de progresso no topo: "12 de 20 itens concluidos (60%)"
- Lista de itens com checkbox, texto, responsavel, prazo
- Input inline no final para adicionar item rapidamente (Enter para confirmar)
- Drag-and-drop para reordenar (usando touch events simples, similar ao swipe do StageCard)
- Ao marcar item como concluido, habilita botao de upload de foto de comprovacao
- Menu de acoes: editar checklist, excluir

**`src/components/checklist/ChecklistItemRow.tsx`** - Linha de item individual:
- Checkbox com atualizacao otimista
- Texto do item (editavel inline ao clicar)
- Icones opcionais de responsavel e prazo
- Botao de foto (aparece apos marcar concluido)
- Handle de drag (icone de arrastar)

### 6. Pagina ChecklistsPage

Criar `src/pages/ChecklistsPage.tsx`:
- Sem projeto ativo: mensagem pedindo selecionar projeto
- Lista de checklists ordenada por updated_at desc
- Botao "+ Novo Checklist" no topo
- Status automatico "Atrasado": checklists com `due_date < today` e `status != 'completed'`

### 7. Roteamento e Navegacao

Adicionar em `App.tsx`:
- `/checklists` - ChecklistsPage (listagem)
- `/checklists/:id` - ChecklistDetail (detalhe)

Atualizar `ProjectDetailPage`: atalho "Checklists" navega para `/checklists`.

Adicionar link na `ToolsPage` ou manter acesso via projeto.

---

### Detalhes Tecnicos

- **Otimismo no checkbox**: Usa `queryClient.setQueryData` para atualizar o cache imediatamente, faz o `supabase.update` em background, reverte em caso de erro (`onError` da mutation).
- **Drag-and-drop**: Implementacao leve usando `onDragStart/onDragOver/onDrop` nativo do HTML5 (atributo `draggable`). No mobile, handle de toque para reordenar. Ao soltar, atualiza `sort_order` de todos os itens afetados no banco.
- **Foto de comprovacao**: Upload para bucket `checklist-photos` com path `{checklist_id}/{item_id}/{uuid}.jpg`. Botao de upload so aparece quando `checked = true`.
- **Status automatico**: Calculado no frontend - se `due_date` existe e `due_date < today` e nem todos os itens estao checked, status = "delayed".
- **Input inline**: Input no final da lista com placeholder "Descreva o item...". Ao pressionar Enter, cria o item e limpa o input. Focus permanece no input para adicao rapida.

### Arquivos a criar
- Migracao SQL (tabelas + bucket + RLS)
- `src/hooks/useChecklists.ts`
- `src/pages/ChecklistsPage.tsx`
- `src/components/checklist/ChecklistCard.tsx`
- `src/components/checklist/ChecklistForm.tsx`
- `src/components/checklist/ChecklistDetail.tsx`
- `src/components/checklist/ChecklistItemRow.tsx`

### Arquivos a modificar
- `src/App.tsx` (novas rotas)
- `src/pages/ProjectDetailPage.tsx` (atalho checklists navega para /checklists)
- `public/locales/pt-BR.json` (novas chaves checklist)
- `public/locales/en-US.json` (novas chaves checklist)
