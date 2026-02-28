

## Modulo RDO (Relatorio Diario de Obra)

### Resumo

Criar o modulo completo de RDO com banco de dados (tabelas + storage bucket), listagem, criacao/edicao com upload de fotos, detalhe, resumo semanal e exportacao PDF com compartilhamento via WhatsApp, Telegram e email.

---

### 1. Banco de dados

**Tabela `rdos`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| project_id | uuid | FK -> projects.id CASCADE | No |
| user_id | uuid | auth.uid() | No |
| date | date | - | No |
| activities | text | '' | Yes |
| observations | text | '' | Yes |
| created_at | timestamptz | now() | No |
| updated_at | timestamptz | now() | No |

Constraint UNIQUE em `(project_id, date)` para impedir duplicatas.

**Tabela `rdo_team_members`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| rdo_id | uuid | FK -> rdos.id CASCADE | No |
| name | text | - | No |
| role | text | '' | Yes |
| hours_worked | numeric(4,1) | 0 | No |

**Tabela `rdo_photos`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| rdo_id | uuid | FK -> rdos.id CASCADE | No |
| storage_path | text | - | No |
| caption | text | '' | Yes |
| annotations_json | jsonb | null | Yes |
| sort_order | integer | 0 | No |

**Storage bucket**: `rdo-photos` (public) com RLS para que apenas o owner do projeto possa fazer upload/delete.

**RLS**: Todas as tabelas com policies baseadas em `EXISTS (SELECT 1 FROM projects WHERE projects.id = rdos.project_id AND projects.owner_id = auth.uid())`.

### 2. Traducoes (i18n)

Novas chaves em ambos os locales:

```
"rdo": {
  "title": "Diario de Obra",
  "newRdo": "Novo RDO",
  "editRdo": "Editar RDO",
  "date": "Data",
  "activities": "Atividades realizadas",
  "observations": "Observacoes gerais",
  "team": "Equipe presente",
  "addMember": "Adicionar membro",
  "memberName": "Nome",
  "memberRole": "Funcao",
  "hoursWorked": "Horas",
  "photos": "Fotos",
  "addPhotos": "Adicionar fotos",
  "caption": "Legenda",
  "noRdos": "Nenhum RDO cadastrado",
  "noRdosDesc": "Registre o primeiro relatorio diario",
  "duplicateDate": "Ja existe um RDO nesta data. Deseja edita-lo?",
  "editExisting": "Editar existente",
  "weeklySummary": "Resumo da semana",
  "export": "Exportar PDF",
  "shareWhatsapp": "Enviar por WhatsApp",
  "shareTelegram": "Enviar por Telegram",
  "shareEmail": "Enviar por e-mail",
  "annotate": "Anotar foto",
  "deletePhoto": "Excluir foto",
  "noFutureDate": "Nao e permitido data futura"
}
```

### 3. Hook `useRdos`

Criar `src/hooks/useRdos.ts`:
- React Query + Supabase CRUD para `rdos`, `rdo_team_members`, `rdo_photos`
- `fetchRdos(projectId)`: lista ordenada por data desc, com contagem de fotos
- `fetchRdoDetail(rdoId)`: RDO completo com team_members e photos
- `createRdo`, `updateRdo`, `deleteRdo`
- `checkDuplicateDate(projectId, date)`: retorna RDO existente ou null
- `fetchWeeklySummary(projectId)`: agrega RDOs dos ultimos 7 dias

### 4. Componentes

**`src/components/rdo/RdoCard.tsx`** - Card para a listagem:
- Data formatada, thumbnail da primeira foto (ou placeholder), resumo truncado das atividades
- Badge com contagem de fotos e membros da equipe
- Click navega para detalhe

**`src/components/rdo/RdoForm.tsx`** - Formulario Dialog/Drawer:
- DatePicker (padrao = hoje, max = hoje, sem datas futuras)
- Textarea para atividades
- Lista dinamica de membros: campos nome, funcao, horas - botao "+ Adicionar membro"
- Grid de upload de fotos: accept image/*, multiplo, preview em miniatura, caption por foto
- Textarea para observacoes
- Ao selecionar data, verifica duplicata e sugere editar existente
- Validacao com zod

**`src/components/rdo/PhotoAnnotator.tsx`** - Anotador de fotos:
- Canvas overlay sobre a imagem
- Ferramentas: pincel (cores/tamanhos), texto, borracha, desfazer
- Salva anotacoes como JSON (coordenadas + strokes) no campo `annotations_json`
- Renderiza anotacoes sobre a foto na visualizacao

**`src/components/rdo/RdoDetail.tsx`** - Tela de detalhe:
- Todas as informacoes do RDO
- Galeria de fotos expandivel (click para fullscreen com anotacoes)
- Tabela de equipe presente
- Botoes de acao: editar, exportar PDF, compartilhar

**`src/components/rdo/WeeklySummary.tsx`** - Resumo semanal:
- Agrega atividades dos ultimos 7 dias
- Total de horas da equipe
- Grid de todas as fotos do periodo
- Botao de exportar PDF do resumo

**`src/components/rdo/RdoExportMenu.tsx`** - Menu de exportacao:
- Gera PDF client-side usando a API de print do browser (window.print com CSS @media print) ou uma div oculta renderizada como PDF
- Opcoes de compartilhamento:
  - WhatsApp: `https://wa.me/?text=...` com link do PDF ou texto resumido
  - Telegram: `https://t.me/share/url?url=...&text=...`
  - Email: `mailto:?subject=...&body=...`
- Nota: como nao ha servidor para hospedar PDFs, o fluxo sera gerar o PDF no browser, o usuario salva/compartilha manualmente, ou usa Web Share API quando disponivel

### 5. Pagina RdoPage

Criar `src/pages/RdoPage.tsx`:
- Sem projeto ativo: mensagem pedindo selecionar projeto
- Lista de RDOs ordenada por data (mais recente primeiro)
- Botao "+ Novo RDO" no topo
- Botao "Resumo da semana" no topo
- Click no card abre detalhe

### 6. Roteamento

Adicionar em `App.tsx`:
- `/rdo` - RdoPage (listagem)
- `/rdo/:id` - RdoDetail (detalhe)

Atualizar `ProjectDetailPage` para que o atalho "RDO" navegue para `/rdo`.

### 7. Exportacao PDF

Abordagem client-side usando `window.print()` com CSS `@media print`:
- Componente `RdoPrintView` renderiza o RDO em formato imprimivel
- O usuario usa "Salvar como PDF" do dialogo de impressao do browser
- Web Share API (`navigator.share()`) para compartilhar diretamente quando disponivel no mobile
- Fallback para links diretos WhatsApp/Telegram/email com texto resumido do RDO

---

### Detalhes Tecnicos

- **Upload de fotos**: Usa Supabase Storage com bucket `rdo-photos`. Path: `{project_id}/{rdo_id}/{uuid}.jpg`. Upload via `supabase.storage.from('rdo-photos').upload()`.
- **Anotacoes**: Canvas HTML5 com `getContext('2d')`. Strokes salvos como array de pontos `{x, y, color, width}` em JSON. Para texto, posicao `{x, y, text, fontSize, color}`. Renderizado sobre a imagem no detalhe.
- **Duplicata de data**: Query `select id from rdos where project_id = ? and date = ?` antes de abrir form de criacao.
- **Resumo semanal**: Query com filtro `date >= today - 7 days`, agrega no frontend.
- **PDF via print**: Componente hidden com `@media print` que mostra apenas o conteudo do RDO formatado. Alternativa: usar `html2canvas` + `jspdf` se precisar de PDF real para compartilhar (requer instalar dependencias extras).

### Arquivos a criar
- `src/hooks/useRdos.ts`
- `src/pages/RdoPage.tsx`
- `src/components/rdo/RdoCard.tsx`
- `src/components/rdo/RdoForm.tsx`
- `src/components/rdo/RdoDetail.tsx`
- `src/components/rdo/PhotoAnnotator.tsx`
- `src/components/rdo/WeeklySummary.tsx`
- `src/components/rdo/RdoExportMenu.tsx`
- `src/components/rdo/RdoPrintView.tsx`

### Arquivos a modificar
- `src/App.tsx` (novas rotas)
- `src/pages/ProjectDetailPage.tsx` (atalho RDO navega para /rdo)
- `public/locales/pt-BR.json` (novas chaves rdo)
- `public/locales/en-US.json` (novas chaves rdo)

### Migracoes de banco
- Criar tabelas `rdos`, `rdo_team_members`, `rdo_photos` com RLS
- Criar bucket `rdo-photos` com policies de storage
- Trigger `update_updated_at_column` na tabela `rdos`

