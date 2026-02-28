

## Perfil e Configuracoes - Tela Completa

### Resumo

Reescrever a tela de Perfil com secoes completas: avatar com upload, dados pessoais editaveis, lista de projetos com criar/arquivar, plano atual com tela de upgrade, sobre o app e logout. Tambem criar um bucket de storage para avatares.

---

### 1. Banco de dados / Storage

**Storage bucket**: `avatars` (public). Necessario para upload de foto de perfil.

RLS no bucket: permitir que usuarios autenticados facam upload/delete de seus proprios avatares (path baseado em `auth.uid()`).

Nenhuma tabela nova necessaria - o campo `avatar_url` ja existe na tabela `profiles`.

---

### 2. Atualizar PlanType no Store

Atualizar `src/stores/useAppStore.ts`:
- Adicionar tipo `'flipper'` ao `PlanType`: `'free' | 'basic' | 'flipper' | 'pro'`
- Atualizar `FEATURE_ACCESS` com as permissoes do plano Flipper (igual ao basic + `financial_module`)
- Adicionar novas feature keys se necessario: `'financial_module'` ja existe

---

### 3. Traducoes (i18n)

Novas chaves `profile` em ambos os locales:

```text
"profile": {
  "title": "Meu Perfil",
  "editProfile": "Editar perfil",
  "save": "Salvar",
  "avatar": "Foto de perfil",
  "changeAvatar": "Alterar foto",
  "myProjects": "Meus projetos",
  "createProject": "Criar novo projeto",
  "archiveProject": "Arquivar",
  "myPlan": "Meu plano",
  "freePlan": "Gratuito",
  "viewPlans": "Ver planos",
  "upgradePlans": "Escolha seu plano",
  "currentPlan": "Plano atual",
  "planFree": "Gratuito",
  "planBasic": "Basic",
  "planFlipper": "Flipper",
  "planPro": "Pro",
  "planFreeDesc": "1 projeto, 1 membro, sem exportacao PDF",
  "planBasicDesc": "Ate 3 projetos, 3 membros, exportacao PDF",
  "planFlipperDesc": "Ate 3 projetos, 5 membros, exportacao PDF, modulo financeiro",
  "planProDesc": "Ate 10 projetos, 10 membros, todos os modulos",
  "projectLimit": "{{count}} projeto(s)",
  "memberLimit": "{{count}} membro(s)",
  "pdfExport": "Exportacao PDF",
  "financialModule": "Modulo financeiro",
  "allModules": "Todos os modulos",
  "aboutApp": "Sobre o app",
  "version": "Versao",
  "termsOfUse": "Termos de uso",
  "privacyPolicy": "Politica de privacidade",
  "logout": "Sair da conta",
  "uploadingAvatar": "Enviando foto..."
}
```

---

### 4. Componentes

**`src/components/profile/AvatarUpload.tsx`:**
- Avatar circular grande (80px) com foto ou iniciais
- Botao "Alterar foto" sobreposto ou abaixo
- Input file hidden (accept="image/*")
- Ao selecionar: upload para bucket `avatars/{user_id}.jpg`, atualiza `profiles.avatar_url`
- Loading state durante upload

**`src/components/profile/PlanCard.tsx`:**
- Card mostrando plano atual com badge colorido
- Botao "Ver planos" que abre drawer/dialog com cards dos 4 planos
- Cada card de plano: nome, preco (placeholder), lista de features, botao "Selecionar" (apenas visual, sem pagamento real por enquanto)

**`src/components/profile/ProjectListSection.tsx`:**
- Secao "Meus projetos" com lista compacta dos projetos
- Cada item: nome + status badge + botao arquivar (muda status para 'cancelled')
- Botao "+ Criar novo projeto" que abre o drawer de criacao (reutilizar logica do ProjectsPage)

**`src/components/profile/AboutSection.tsx`:**
- Card com versao do app (hardcoded "1.0.0")
- Links: Termos de uso, Politica de privacidade (placeholder URLs)

---

### 5. Reescrever ProfilePage

`src/pages/ProfilePage.tsx` com layout:

1. **Avatar + Nome + Email + Tipo de conta** (header com AvatarUpload)
2. **Edicao de perfil** (nome editavel inline)
3. **Meus projetos** (ProjectListSection)
4. **Meu plano** (PlanCard)
5. **Sobre o app** (AboutSection)
6. **Botao Sair** (sempre visivel, nao apenas mobile)

---

### Detalhes Tecnicos

- **Upload de avatar**: Path `avatars/{user_id}.jpg`. Sobrescreve o anterior (upsert: true). Gera URL publica e salva em `profiles.avatar_url`.
- **Planos**: Apenas visual por enquanto. Nao ha integracao com pagamento. O `PlanType` no store continua como `'free'` ate implementar billing.
- **Arquivar projeto**: Altera status para `'cancelled'` via supabase update. Nao deleta.
- **Drawer de criacao de projeto**: Pode-se extrair o form do ProjectsPage em um componente reutilizavel, ou simplesmente navegar para `/projects` com query param para abrir o drawer.
- **Responsividade**: Layout em coluna unica, funciona bem em mobile e desktop.

### Arquivos a criar
- Migracao SQL (bucket `avatars` + RLS de storage)
- `src/components/profile/AvatarUpload.tsx`
- `src/components/profile/PlanCard.tsx`
- `src/components/profile/ProjectListSection.tsx`
- `src/components/profile/AboutSection.tsx`

### Arquivos a modificar
- `src/pages/ProfilePage.tsx` (reescrever completamente)
- `src/stores/useAppStore.ts` (adicionar PlanType 'flipper')
- `public/locales/pt-BR.json` (novas chaves profile)
- `public/locales/en-US.json` (novas chaves profile)

