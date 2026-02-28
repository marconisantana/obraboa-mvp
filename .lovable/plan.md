

## Caderno de Referencias - Moodboard de Imagens

### Resumo

Criar um modulo de referencias visuais estilo Pinterest, onde usuarios podem salvar imagens inspiracionais por projeto, organizadas por categorias (Sala, Cozinha, Banheiro, etc.), com upload local, URL externa e observacoes editaveis.

---

### 1. Banco de dados

**Tabela `references`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| project_id | uuid | FK -> projects.id CASCADE | No |
| user_id | uuid | auth.uid() | No |
| image_url | text | - | No |
| storage_path | text | null | Yes |
| category | text | 'outros' | No |
| observation | text | '' | Yes |
| created_at | timestamptz | now() | No |

- `image_url`: URL publica (do storage ou URL externa)
- `storage_path`: preenchido apenas quando o upload e local (para poder deletar do storage)

**Storage bucket**: `reference-images` (public).

**RLS**: Policies baseadas em `EXISTS (SELECT 1 FROM projects WHERE projects.id = references.project_id AND projects.owner_id = auth.uid())` para SELECT, INSERT, UPDATE e DELETE.

---

### 2. Traducoes (i18n)

Novas chaves `references` em `pt-BR.json` e `en-US.json`:

```text
"references": {
  "title": "Referencias",
  "new": "Nova referencia",
  "addFromUrl": "Adicionar por URL",
  "uploadImage": "Enviar imagem",
  "imageUrl": "URL da imagem",
  "observation": "Observacao",
  "category": "Categoria",
  "all": "Todos",
  "livingRoom": "Sala",
  "kitchen": "Cozinha",
  "bathroom": "Banheiro",
  "bedroom": "Quarto",
  "facade": "Fachada",
  "other": "Outros",
  "noReferences": "Nenhuma referencia salva",
  "noReferencesDesc": "Salve imagens de inspiracao para sua obra",
  "deleteConfirm": "Tem certeza que deseja excluir esta referencia?",
  "share": "Compartilhar",
  "selectProject": "Selecione um projeto para ver as referencias",
  "preview": "Pre-visualizar",
  "invalidUrl": "URL invalida"
}
```

---

### 3. Hook `useReferences`

Criar `src/hooks/useReferences.ts`:

- `fetchReferences(projectId, category?)`: lista referencias, com filtro opcional por categoria
- `createFromUpload(projectId, file, category, observation)`: upload para bucket `reference-images` + insert
- `createFromUrl(projectId, imageUrl, category, observation)`: insert direto com URL externa
- `updateObservation(refId, observation)`: atualiza observacao
- `updateCategory(refId, category)`: atualiza categoria
- `deleteReference(refId)`: remove do storage (se storage_path) + deleta do banco

---

### 4. Componentes

**`src/components/references/ReferenceCard.tsx`:**
- Card com imagem (aspect-ratio livre, masonry), badge de categoria colorido, preview truncado da observacao
- Click abre modal de detalhe
- Layout pensado para grid masonry

**`src/components/references/ReferenceDetailDialog.tsx`:**
- Modal com imagem em destaque (grande)
- Campo de observacao editavel (textarea com auto-save ou botao salvar)
- Select de categoria editavel
- Botoes: compartilhar, excluir

**`src/components/references/AddReferenceDialog.tsx`:**
- Dialog com duas abas: "Enviar imagem" e "Adicionar por URL"
- Aba upload: input file (accept images) + preview da imagem selecionada
- Aba URL: input de URL + botao preview (carrega `<img>` para validar)
- Select de categoria
- Campo de observacao (opcional)
- Botao salvar

**`src/components/references/CategoryFilter.tsx`:**
- Barra horizontal com chips/badges filtraveis
- Categorias: Todos | Sala | Cozinha | Banheiro | Quarto | Fachada | Outros
- Click em uma categoria filtra o grid

---

### 5. Pagina ReferencesPage

Criar `src/pages/ReferencesPage.tsx`:

- Sem projeto ativo: mensagem pedindo selecionar
- Header com titulo + botao "+ Nova referencia"
- Barra de filtro de categorias (CategoryFilter)
- Grid masonry: CSS columns (2 colunas mobile, 3 desktop) com `break-inside: avoid`
- Cada card renderiza ReferenceCard
- Estado vazio com ilustracao e CTA

---

### 6. Roteamento e Navegacao

- Adicionar rota `/references` em `App.tsx` (dentro das rotas protegidas com AppLayout)
- Adicionar modulo "Referencias" no grid de atalhos do `ProjectDetailPage` com icone `ImagePlus` ou `Images`
- Adicionar na navegacao lateral/bottom se aplicavel

---

### 7. Compartilhamento

- Botao compartilhar no detalhe: usa Web Share API (`navigator.share`) com a URL da imagem + texto da observacao
- Fallback: copiar link da imagem para clipboard

---

### Detalhes Tecnicos

- **Masonry CSS**: Usar `columns: 2` (mobile) / `columns: 3` (desktop) com `break-inside: avoid` em cada card. Simples e sem dependencia extra.
- **Upload**: Bucket `reference-images`, path `{project_id}/{uuid}.{ext}`. Gera URL publica apos upload.
- **URL externa**: Valida carregando a imagem em um `<img>` onerror/onload antes de salvar.
- **Categorias**: Array fixo no frontend. O campo `category` e texto livre, permitindo expansao futura.
- **Badge de categoria**: Cores mapeadas por categoria (azul=Sala, verde=Cozinha, rosa=Banheiro, etc.).
- **Auto-save observacao**: Debounce de 1s no textarea do detalhe, ou botao salvar explicito.

### Arquivos a criar
- Migracao SQL (1 tabela + bucket + RLS)
- `src/hooks/useReferences.ts`
- `src/components/references/ReferenceCard.tsx`
- `src/components/references/ReferenceDetailDialog.tsx`
- `src/components/references/AddReferenceDialog.tsx`
- `src/components/references/CategoryFilter.tsx`
- `src/pages/ReferencesPage.tsx`

### Arquivos a modificar
- `src/App.tsx` (nova rota /references)
- `src/pages/ProjectDetailPage.tsx` (adicionar atalho "Referencias" no grid de modulos)
- `public/locales/pt-BR.json` (novas chaves references)
- `public/locales/en-US.json` (novas chaves references)

