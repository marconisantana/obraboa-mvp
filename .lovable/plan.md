

## Telas Home (Feed) e Visão do Projeto + FAB + Seletor de Projeto

### Resumo

Criar a tela Home com feed de atividades (mock data), a tela Visão do Projeto com detalhes e atalhos de modulos, o seletor de projeto no Header, e o FAB com bottom sheet de acoes rapidas.

---

### 1. Adicionar traducoes ao pt-BR.json

Novas chaves para:
- `home.emptyTitle`, `home.emptyCta` (estado vazio)
- `home.pullToRefresh`
- `home.projectSelector`, `home.allProjects`
- `fab.newRdo`, `fab.newStage`, `fab.newChecklist`, `fab.newOc`, `fab.quickActions`
- `projectView.title`, `projectView.progress`, `projectView.startDate`, `projectView.endDate`, `projectView.invite`, `projectView.members`
- `projectView.modules.schedule`, `projectView.modules.rdo`, `projectView.modules.checklists`, `projectView.modules.purchases`, `projectView.modules.dossiers`, `projectView.modules.references`
- `projects.in_progress` (alias para status "Em andamento" - corrigir se necessario)

---

### 2. Mock data para atividades

Criar `src/data/mockActivities.ts` com ~6 atividades de exemplo:
- Diferentes tipos: rdo, checklist, schedule, purchase_order
- Nomes de membros, descricoes, timestamps recentes
- Avatares placeholder (iniciais)

---

### 3. Componente ProjectSelector

Criar `src/components/ProjectSelector.tsx`:
- Dropdown usando Popover/Command do shadcn
- Mostra nome do projeto ativo com icone ChevronDown
- Lista todos os projetos ao clicar
- Se so tem 1, mostra ele sem dropdown
- Se nao tem nenhum, mostra "Selecione um projeto"
- Ao selecionar, chama `setActiveProject`

---

### 4. Header atualizado

Modificar `src/components/Header.tsx`:
- Mobile: logo icon a esquerda, ProjectSelector no centro, icone Bell (placeholder) a direita
- Desktop: ProjectSelector + Bell (sidebar ja tem logo)

---

### 5. HomePage reformulada (Feed de Atividades)

Reescrever `src/pages/HomePage.tsx`:
- **Com projeto ativo**: mostra feed de atividades mock em cards cronologicos
  - Cada card: avatar circular com iniciais, nome + acao, timestamp relativo (date-fns `formatDistanceToNow`), icone da categoria
- **Sem projeto / projeto vazio**: ilustracao (icone grande) + CTA "Comece adicionando a primeira etapa do cronograma"
- **Sem projetos**: card com CTA para criar projeto
- Pull-to-refresh: detectar swipe down no mobile para "recarregar" feed

---

### 6. FAB com Bottom Sheet de Acoes Rapidas

Criar `src/components/FAB.tsx`:
- Botao flutuante (+) fixo em `bottom-20 right-4` (acima do bottom nav)
- Visivel apenas no mobile (`lg:hidden`)
- Ao clicar, abre Drawer (bottom sheet) com 4 opcoes:
  - Novo RDO (icone FileText)
  - Nova Etapa (icone CalendarDays)
  - Novo Checklist (icone CheckSquare)
  - Nova OC (icone ShoppingCart)
- Cada opcao com icone + label, por enquanto mostra toast "Em breve"
- Mover o FAB do ProjectsPage para ca (remover duplicacao)

---

### 7. Tela Visao do Projeto

Criar `src/pages/ProjectDetailPage.tsx`:
- Rota: `/projects/:id` (nova rota no App.tsx)
- Tambem acessivel pela aba "Projetos" quando ha projeto ativo
- **Card de capa**: cor solida de fundo (primary/10) como padrao
- **Info**: nome, endereco, badge de status colorido
- **Barra de progresso**: linear com % mock (ex: 35%)
- **Datas**: inicio previsto -> conclusao prevista
- **Membros**: row de avatares circulares mock + botao "Convidar" (placeholder)
- **Grade de atalhos**: grid 3x2 com cards para cada modulo:
  - Cronograma, RDO, Checklists, Compras, Dossies, Referencias
  - Cada card com icone + label, navega para rota futura ou mostra toast

---

### 8. Roteamento

Atualizar `src/App.tsx`:
- Adicionar rota `/projects/:id` -> `ProjectDetailPage`
- FAB sera adicionado no `AppLayout` para aparecer em todas as telas

---

### 9. AppLayout atualizado

Modificar `src/components/AppLayout.tsx`:
- Incluir componente `<FAB />` no layout
- Remover FAB duplicado do ProjectsPage

---

### Detalhes Tecnicos

- **Pull-to-refresh**: implementar com touch events simples (onTouchStart/onTouchMove/onTouchEnd) que detecta swipe para baixo quando scroll esta no topo
- **Timestamp relativo**: usar `formatDistanceToNow` do date-fns com locale pt-BR
- **Mock data**: dados estaticos em arquivo separado, sem chamadas ao banco
- **FAB**: removido do ProjectsPage, centralizado no AppLayout
- **ProjectSelector**: usa Popover + lista simples, consome `projects` e `activeProject` do Zustand store

### Arquivos a criar
- `src/data/mockActivities.ts`
- `src/components/ProjectSelector.tsx`
- `src/components/FAB.tsx`
- `src/pages/ProjectDetailPage.tsx`

### Arquivos a modificar
- `public/locales/pt-BR.json` (novas chaves)
- `public/locales/en-US.json` (novas chaves)
- `src/components/Header.tsx` (seletor + bell)
- `src/pages/HomePage.tsx` (feed completo)
- `src/components/AppLayout.tsx` (adicionar FAB)
- `src/pages/ProjectsPage.tsx` (remover FAB, click navega para detalhe)
- `src/App.tsx` (nova rota /projects/:id)

