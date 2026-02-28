

## Estrutura Multi-Usuario por Projeto

### Resumo

Implementar o fluxo completo de convite de membros por link: gerar convite no app, copiar/compartilhar link, aceitar convite (com cadastro simplificado se necessario), e exibir/gerenciar membros na tela do projeto.

As tabelas `project_members` e `project_invites` ja existem no banco. As funcoes RLS `is_project_member` e `get_project_role` tambem ja estao criadas. O foco sera no codigo frontend e em uma edge function para aceitar convites.

---

### 1. Edge Function: `accept-invite`

Criar `supabase/functions/accept-invite/index.ts`:

- Recebe `{ token }` via POST
- Valida: token existe, nao foi usado, nao expirou
- Pega o `profile_id` do usuario autenticado (via JWT no header)
- Insere em `project_members` (project_id, profile_id, role do convite)
- Marca `used_at = now()` no convite
- Retorna o `project_id` para redirecionamento

Necessario porque o INSERT em `project_members` requer role owner/professional (RLS), mas o convidado ainda nao e membro. A edge function usa service role key para bypassar RLS.

---

### 2. Pagina publica: `/invite/:token`

Criar `src/pages/AcceptInvitePage.tsx`:

- Rota publica (fora do ProtectedRoute)
- Ao carregar, verifica se o usuario esta logado
  - Se logado: chama a edge function `accept-invite` com o token, redireciona para `/projects/:id`
  - Se nao logado: salva o token no localStorage, redireciona para `/signup` com query param `?invite=true`
- Apos signup/login, o fluxo detecta o token pendente e aceita automaticamente

---

### 3. Modificar fluxo de auth para convites pendentes

Atualizar `src/contexts/AuthContext.tsx`:

- Apos login/signup bem-sucedido, verificar se existe token de convite pendente no localStorage
- Se existir, chamar a edge function `accept-invite`
- Limpar o token do localStorage apos aceitar

---

### 4. Componente: `InviteMemberDialog`

Criar `src/components/members/InviteMemberDialog.tsx`:

- Dialog/Drawer aberto pelo botao "Convidar" no ProjectDetailPage
- Campos: role (select: profissional, cliente, viewer)
- Ao confirmar:
  - Gera token aleatorio (crypto.randomUUID)
  - Insere em `project_invites` com `expires_at = now() + 7 dias`
  - Monta URL: `{origin}/invite/{token}`
  - Exibe URL com botao "Copiar link" e opcoes de compartilhar (WhatsApp, email)

---

### 5. Componente: `MembersSection`

Criar `src/components/members/MembersSection.tsx`:

- Lista completa de membros do projeto com avatar, nome e role
- Badge colorido por role (owner = azul, profissional = verde, cliente = laranja, viewer = cinza)
- Owner pode remover membros (exceto a si mesmo)
- Owner pode alterar role de membros

Substituir o trecho de membros no `ProjectDetailPage.tsx` por este componente.

---

### 6. Rota no App.tsx

Adicionar rota publica: `<Route path="/invite/:token" element={<AcceptInvitePage />} />`

---

### 7. Traducoes (i18n)

Novas chaves em ambos os locales:

```text
"members": {
  "invite": "Convidar membro",
  "inviteTitle": "Convidar para o projeto",
  "selectRole": "Selecione o papel",
  "owner": "Proprietario",
  "professional": "Profissional",
  "client": "Cliente",
  "viewer": "Visualizador",
  "ownerDesc": "Acesso total ao projeto",
  "professionalDesc": "Acesso total exceto deletar projeto",
  "clientDesc": "Visualiza cronograma, referencias, checklists",
  "viewerDesc": "Apenas visualizacao",
  "generateLink": "Gerar link de convite",
  "copyLink": "Copiar link",
  "linkCopied": "Link copiado!",
  "linkExpires": "Link valido por 7 dias",
  "shareWhatsapp": "Compartilhar via WhatsApp",
  "shareEmail": "Compartilhar por e-mail",
  "removeMember": "Remover membro",
  "removeConfirm": "Tem certeza que deseja remover este membro?",
  "changeRole": "Alterar papel",
  "acceptingInvite": "Aceitando convite...",
  "inviteAccepted": "Convite aceito! Voce agora e membro do projeto.",
  "inviteExpired": "Este convite expirou ou ja foi utilizado.",
  "inviteNotFound": "Convite nao encontrado.",
  "loginToAccept": "Faca login ou crie uma conta para aceitar o convite."
}
```

---

### Arquivos a criar

- `supabase/functions/accept-invite/index.ts` - Edge function para aceitar convite
- `src/pages/AcceptInvitePage.tsx` - Pagina publica de aceite
- `src/components/members/InviteMemberDialog.tsx` - Dialog de convite
- `src/components/members/MembersSection.tsx` - Secao de membros expandida

### Arquivos a modificar

- `src/App.tsx` - Adicionar rota `/invite/:token`
- `src/pages/ProjectDetailPage.tsx` - Usar MembersSection
- `src/contexts/AuthContext.tsx` - Aceitar convite pendente apos login
- `public/locales/pt-BR.json` - Novas chaves members
- `public/locales/en-US.json` - Novas chaves members

### Sem alteracoes no banco

As tabelas `project_members` e `project_invites` ja existem com a estrutura necessaria. As funcoes RLS tambem ja estao prontas. Nenhuma migracao SQL necessaria.

