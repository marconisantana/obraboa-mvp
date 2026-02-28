

## Cronograma de Servicos

### Resumo

Criar o modulo completo de Cronograma de Servicos com tabela no banco de dados, duas visualizacoes (Lista e Gantt simplificado), formulario de criacao/edicao de etapas, sistema de predecessores/dependencias, e acoes por etapa (editar, concluir, excluir com swipe).

---

### 1. Tabela no banco de dados: `stages`

Criar tabela `stages` com as seguintes colunas:

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| project_id | uuid | - | No (FK -> projects.id ON DELETE CASCADE) |
| title | text | - | No |
| description | text | '' | Yes |
| service_type | text | 'general' | No |
| environment | text | '' | Yes |
| responsible_name | text | '' | Yes |
| start_date | date | - | No |
| end_date | date | - | No |
| status | text | 'pending' | No |
| progress | integer | 0 | No |
| predecessor_id | uuid | null | Yes (FK -> stages.id ON DELETE SET NULL) |
| created_at | timestamptz | now() | No |
| updated_at | timestamptz | now() | No |

RLS policies:
- SELECT: owner do projeto pode ver
- INSERT: owner do projeto pode criar
- UPDATE: owner do projeto pode editar
- DELETE: owner do projeto pode excluir

Trigger `update_updated_at_column` na tabela.

### 2. Traducoes (i18n)

Novas chaves em `pt-BR.json` e `en-US.json`:

```
"schedule": {
  "title": "Cronograma",
  "addStage": "Adicionar Etapa",
  "editStage": "Editar Etapa",
  "viewList": "Lista",
  "viewTimeline": "Linha do tempo",
  "sortByDate": "Por data",
  "sortByStatus": "Por status",
  "noStages": "Nenhuma etapa cadastrada",
  "noStagesDesc": "Adicione a primeira etapa do cronograma",
  "stageTitle": "Titulo",
  "startDate": "Data de inicio",
  "endDate": "Data de fim",
  "responsible": "Responsavel",
  "serviceType": "Tipo de servico",
  "environment": "Ambiente",
  "description": "Descricao",
  "status": "Status",
  "progress": "Progresso",
  "predecessor": "Predecessor",
  "noPredecessor": "Nenhum",
  "pending": "Pendente",
  "in_progress": "Em andamento",
  "completed": "Concluido",
  "delayed": "Atrasado",
  "markComplete": "Marcar como concluida",
  "deleteConfirm": "Tem certeza que deseja excluir esta etapa?",
  "predecessorWarning": "Esta etapa possui dependentes. Deseja aplicar a mesma alteracao de datas aos dependentes?",
  "applyToDependents": "Aplicar aos dependentes",
  "skipDependents": "Apenas esta etapa",
  "selectPredecessor": "Vincular a uma etapa existente?"
}
```

### 3. Hook `useStages`

Criar `src/hooks/useStages.ts`:
- Usa React Query + Supabase para CRUD de stages por `project_id`
- Funcoes: `fetchStages`, `createStage`, `updateStage`, `deleteStage`
- Ao atualizar datas de uma etapa com dependentes, buscar todas as stages que tem `predecessor_id` igual a ela e retornar para a UI perguntar ao usuario

### 4. Componentes

**`src/components/schedule/StageCard.tsx`** - Card de etapa para a visualizacao em lista:
- Titulo, badge de status colorido (cinza/azul/verde/vermelho)
- Barra de progresso inline com %
- Datas inicio-fim, responsavel (avatar com iniciais), tipo de servico
- Swipe left no mobile revela botoes editar/excluir (usando touch events)
- Botao de menu (tres pontos) no desktop com opcoes: editar, marcar concluida, excluir

**`src/components/schedule/StageForm.tsx`** - Formulario Dialog/Drawer:
- Campos: titulo, data inicio, data fim, responsavel, tipo de servico, ambiente, descricao, status inicial
- Select de predecessor: lista todas as outras etapas do projeto
- Validacao com react-hook-form + zod
- Modo criacao e edicao

**`src/components/schedule/GanttTimeline.tsx`** - Visualizacao Gantt simplificada:
- Container com scroll horizontal
- Eixo X: dias/semanas entre a menor data de inicio e maior data de fim
- Cada etapa como barra horizontal colorida pelo status
- Label do titulo na barra
- Linhas de conexao simples (seta) entre predecessor e dependente
- Click na barra abre o formulario de edicao

**`src/components/schedule/DependencyDialog.tsx`** - Dialog de confirmacao:
- Aparece ao alterar datas de etapa que possui dependentes
- Pergunta: "Deseja aplicar a mesma alteracao de datas aos dependentes?"
- Opcoes: "Aplicar aos dependentes" / "Apenas esta etapa"

### 5. Pagina SchedulePage reformulada

Reescrever `src/pages/SchedulePage.tsx`:
- **Sem projeto ativo**: mostra mensagem pedindo para selecionar projeto
- **Com projeto ativo**:
  - Toggle no topo: Lista | Linha do tempo (usando Tabs do shadcn)
  - Botao de ordenacao: por data (padrao) ou por status
  - Botao "+ Adicionar Etapa" no topo
  - Tab Lista: renderiza StageCards
  - Tab Timeline: renderiza GanttTimeline
  - Estado vazio: ilustracao + CTA

### 6. Roteamento

A rota `/schedule` ja existe no `App.tsx`. O modulo de cronograma tambem sera acessivel pelo atalho na tela de detalhe do projeto (`ProjectDetailPage`), que navegara para `/schedule` setando o projeto ativo.

---

### Detalhes Tecnicos

- **Swipe-to-action**: Touch events simples (onTouchStart/Move/End) que detecta swipe esquerdo > 80px para revelar botoes de acao. Sem biblioteca externa.
- **Gantt**: Implementacao custom com divs posicionadas. Calculo de posicao: `(stageStart - timelineStart) / totalDays * 100%` para left, `(stageEnd - stageStart) / totalDays * 100%` para width.
- **Predecessores**: Ao salvar alteracao de datas, o hook verifica se existem stages com `predecessor_id = stage.id`. Se sim, retorna a lista para o componente exibir o DependencyDialog. Se o usuario confirmar, aplica o mesmo delta de dias a todos os dependentes recursivamente.
- **Status automatico "Atrasado"**: Na query, stages com `end_date < today` e `status != 'completed'` sao exibidas com badge "Atrasado" (calculado no frontend, nao salvo no banco).
- **React Query**: invalidate queries apos mutations para manter dados sincronizados.

### Arquivos a criar
- `src/hooks/useStages.ts`
- `src/components/schedule/StageCard.tsx`
- `src/components/schedule/StageForm.tsx`
- `src/components/schedule/GanttTimeline.tsx`
- `src/components/schedule/DependencyDialog.tsx`

### Arquivos a modificar
- `public/locales/pt-BR.json` (novas chaves schedule)
- `public/locales/en-US.json` (novas chaves schedule)
- `src/pages/SchedulePage.tsx` (reescrever completo)
- `src/pages/ProjectDetailPage.tsx` (atalho cronograma navega para /schedule)

