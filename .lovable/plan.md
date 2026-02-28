

## Modulo Organizador de Documentos

### Resumo

Criar um organizador de documentos com layout estilo Dropbox: navegacao por pastas com breadcrumb, upload de arquivos, preview inline, compartilhamento de links e gestao de pastas/arquivos.

---

### 1. Banco de dados

**Tabela `document_folders`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| project_id | uuid | FK -> projects.id CASCADE | No |
| parent_id | uuid | FK -> document_folders.id CASCADE | Yes (null = raiz) |
| name | text | - | No |
| created_at | timestamptz | now() | No |
| user_id | uuid | auth.uid() | No |

**Tabela `document_files`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| project_id | uuid | FK -> projects.id CASCADE | No |
| folder_id | uuid | FK -> document_folders.id SET NULL | Yes (null = raiz) |
| name | text | - | No |
| storage_path | text | - | No |
| file_type | text | - | No |
| file_size | bigint | 0 | No |
| uploaded_by | uuid | auth.uid() | No |
| created_at | timestamptz | now() | No |

**Storage bucket**: `project-documents` (public).

**RLS**: Policies baseadas em `EXISTS (SELECT 1 FROM projects WHERE projects.id = <table>.project_id AND projects.owner_id = auth.uid())` para ambas as tabelas. CRUD completo (SELECT, INSERT, UPDATE, DELETE).

**Pastas padrao**: Ao criar um projeto (ou ao acessar documents pela primeira vez), criar automaticamente 4 pastas raiz: "Projetos", "Contratos", "Fotos", "Outros". Isso sera feito no frontend (verificar se existem pastas, se nao criar as 4).

---

### 2. Traducoes (i18n)

Novas chaves em `pt-BR.json` e `en-US.json`:

```text
"documents": {
  "title": "Documentos",
  "newFolder": "Nova pasta",
  "uploadFiles": "Enviar arquivos",
  "folderName": "Nome da pasta",
  "rename": "Renomear",
  "delete": "Excluir",
  "deleteConfirm": "Tem certeza que deseja excluir?",
  "deleteFolderWarning": "Todos os arquivos dentro desta pasta serao excluidos.",
  "download": "Baixar",
  "copyLink": "Copiar link",
  "linkCopied": "Link copiado!",
  "preview": "Visualizar",
  "noFiles": "Nenhum arquivo neste diretorio",
  "noFilesDesc": "Envie arquivos ou crie pastas para organizar seus documentos",
  "size": "Tamanho",
  "uploadedAt": "Enviado em",
  "uploadedBy": "Enviado por",
  "selectProject": "Selecione um projeto para ver os documentos",
  "rootFolder": "Documentos",
  "defaultFolderProjects": "Projetos",
  "defaultFolderContracts": "Contratos",
  "defaultFolderPhotos": "Fotos",
  "defaultFolderOthers": "Outros",
  "renamePlaceholder": "Novo nome",
  "uploading": "Enviando..."
}
```

---

### 3. Hook `useDocuments`

Criar `src/hooks/useDocuments.ts`:

- `fetchFolders(projectId, parentId)`: lista pastas filhas de um diretorio
- `fetchFiles(projectId, folderId)`: lista arquivos de um diretorio
- `ensureDefaultFolders(projectId)`: cria as 4 pastas padrao se nao existirem
- `createFolder(projectId, parentId, name)`
- `renameFolder(folderId, newName)`, `deleteFolder(folderId)` (deleta recursivamente)
- `uploadFiles(projectId, folderId, files[])`: upload para bucket + insert no banco
- `renameFile(fileId, newName)`, `deleteFile(fileId)` (remove do storage + banco)
- `getFilePublicUrl(storagePath)`: URL publica
- `getTemporaryLink(storagePath)`: URL assinada temporaria para compartilhamento
- `fetchBreadcrumb(folderId)`: consulta recursiva para montar o caminho de pastas

---

### 4. Componentes

**`src/components/documents/DocumentBreadcrumb.tsx`:**
- Breadcrumb com links clicaveis: "Documentos > Contratos > Subpasta"
- Usa o componente Breadcrumb do shadcn/ui ja existente
- Click em cada nivel navega para aquela pasta

**`src/components/documents/FolderCard.tsx`:**
- Icone de pasta, nome, data de criacao
- Click abre a pasta (navega)
- Menu de contexto: renomear, excluir

**`src/components/documents/FileRow.tsx`:**
- Icone por tipo (PDF, imagem, planilha, DWG, generico)
- Nome, tamanho formatado (KB/MB), data de upload, nome de quem enviou
- Acoes: preview, download, copiar link, renomear, excluir

**`src/components/documents/FilePreviewDialog.tsx`:**
- Modal para preview inline
- Imagens: renderiza `<img>` direto
- PDFs: renderiza em `<iframe>` com URL publica
- Outros tipos: mostra icone grande + informacoes + botao de download

**`src/components/documents/CreateFolderDialog.tsx`:**
- Dialog simples com input de nome + botao criar

**`src/components/documents/RenameDialog.tsx`:**
- Dialog com input preenchido com nome atual + botao salvar

---

### 5. Pagina DocumentsPage

Reescrever `src/pages/DocumentsPage.tsx`:

- Sem projeto ativo: mensagem pedindo selecionar
- State local: `currentFolderId` (null = raiz)
- Breadcrumb no topo
- Secao de pastas (grid de cards)
- Secao de arquivos (lista/tabela com icone, nome, tamanho, data, autor)
- Botoes no topo: "+ Nova pasta" e "Enviar arquivos"
- Input de upload: accept=".pdf,.jpeg,.jpg,.png,.xlsx,.xls,.dwg" multiple
- Ao entrar na primeira vez, chama `ensureDefaultFolders`

---

### 6. Roteamento

A rota `/documents` ja existe no `App.tsx`. Nao precisa de rota nova. A navegacao de pastas sera feita via state local (nao via URL), mantendo simples.

Atualizar `ProjectDetailPage`: adicionar "Documentos" como modulo no grid de atalhos, navegando para `/documents`.

---

### Detalhes Tecnicos

- **Upload**: Bucket `project-documents`, path `{project_id}/{folder_id || 'root'}/{uuid}_{filename}`. Upload via `supabase.storage.from('project-documents').upload()`.
- **Icone por tipo**: Mapeamento simples: `.pdf` -> FileText vermelho, `.jpg/.jpeg/.png` -> Image azul, `.xlsx/.xls` -> Table verde, `.dwg` -> Ruler laranja, outros -> File cinza.
- **Tamanho formatado**: Funcao utilitaria `formatFileSize(bytes)` que retorna "1.2 MB", "340 KB", etc.
- **Link temporario**: `supabase.storage.from('project-documents').createSignedUrl(path, 3600)` gera URL valida por 1h. Copiar para clipboard via `navigator.clipboard.writeText()`.
- **Download**: Usa a URL publica com atributo `download` ou `window.open()`.
- **Breadcrumb recursivo**: Query que busca a pasta atual e seus pais iterativamente ate `parent_id = null`.
- **Delete folder**: Deleta todos os arquivos da pasta (e subpastas) do storage primeiro, depois deleta os registros do banco. O CASCADE no FK cuida das subpastas.
- **Pastas padrao**: No `useEffect` do DocumentsPage, verifica se existem pastas raiz. Se nao, cria as 4 com um batch insert.

### Arquivos a criar
- Migracao SQL (2 tabelas + bucket + RLS)
- `src/hooks/useDocuments.ts`
- `src/components/documents/DocumentBreadcrumb.tsx`
- `src/components/documents/FolderCard.tsx`
- `src/components/documents/FileRow.tsx`
- `src/components/documents/FilePreviewDialog.tsx`
- `src/components/documents/CreateFolderDialog.tsx`
- `src/components/documents/RenameDialog.tsx`

### Arquivos a modificar
- `src/pages/DocumentsPage.tsx` (reescrever completamente)
- `src/pages/ProjectDetailPage.tsx` (adicionar atalho "Documentos")
- `public/locales/pt-BR.json` (novas chaves documents)
- `public/locales/en-US.json` (novas chaves documents)

