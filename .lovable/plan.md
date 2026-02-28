

## Substituir Mocks por Supabase + Evoluir Schema

### Contexto

O app ja usa Supabase para a maioria dos dados (projetos, RDOs, checklists, dossiers, documentos, referencias, compras). Os unicos mocks restantes sao:

1. **`mockActivities`** no HomePage - feed de atividades hardcoded
2. **`mockMembers`** no ProjectDetailPage - membros do projeto hardcoded
3. **`MOCK_PROGRESS`** no ProjectDetailPage - progresso hardcoded (35%)

### Abordagem

O schema proposto tem nomes de colunas e tabelas diferentes do existente (ex: `owner_id` vs `created_by`, `stages` vs `schedule_tasks`, `dossiers` vs `dossies`). Renomear tabelas/colunas existentes quebraria todo o codigo do app. A abordagem sera:

1. **Criar tabelas novas** que nao existem: `project_members`, `project_invites`
2. **Adicionar colunas faltantes** em tabelas existentes (ex: `weather` em `rdos`, `unit_price` em `purchase_order_items`)
3. **Substituir os 3 mocks** por dados reais do Supabase
4. **Criar bucket** `project-covers` (publico)
5. **Atualizar RLS** para ser baseada em membership (via `project_members`)
6. **Auto-criar membership** como owner ao criar projeto

---

### 1. Migracao SQL

**Novas tabelas:**

```text
project_members (id, project_id, profile_id, role, joined_at)
  - UNIQUE(project_id, profile_id)
  - role: 'owner' | 'professional' | 'client' | 'viewer'
  - RLS: membros podem ver membros do mesmo projeto

project_invites (id, project_id, invited_by, role, token, expires_at, used_at, created_at)
  - RLS: owner/professional podem criar e ver convites
```

**Colunas novas em tabelas existentes:**

- `rdos`: adicionar coluna `weather` (text, nullable)
- `purchase_order_items`: adicionar coluna `unit_price` (numeric, default 0)

**Auto-membership trigger:**
- Ao inserir um projeto, automaticamente cria um `project_member` com role='owner'

**Funcao helper para RLS:**
- `is_project_member(project_id, user_id)` - retorna boolean
- `get_project_role(project_id, user_id)` - retorna role

**Migrar projetos existentes:**
- INSERT INTO project_members para cada projeto existente (owner_id -> profile com user_id correspondente)

**Bucket:**
- `project-covers` (publico)

---

### 2. Atualizar RLS (member-based)

Trocar todas as policies de `projects.owner_id = auth.uid()` para membership-based:

- **projects SELECT**: usuario e membro do projeto
- **projects UPDATE/DELETE**: role = 'owner'
- **projects INSERT**: manter (auth.uid() = owner_id)
- **Tabelas filhas** (rdos, checklists, stages, etc.): SELECT para qualquer membro, INSERT/UPDATE/DELETE para owner ou professional

Usar funcao `is_project_member()` para evitar recursao infinita.

---

### 3. Substituir Mocks

**HomePage - Feed de Atividades:**
- Remover import de `mockActivities`
- Usar query real: `supabase.from('activities').select('*').eq('project_id', activeProject.id).order('created_at', { ascending: false }).limit(20)`
- Buscar nome do usuario via profiles join ou armazenar no campo description
- Mostrar estado vazio se nao houver atividades

**ProjectDetailPage - Membros:**
- Remover `mockMembers`
- Query: `supabase.from('project_members').select('*, profiles(full_name, avatar_url)').eq('project_id', id)` (usando join com profiles via profile_id -> profiles.id por user_id)
- Renderizar avatares reais dos membros

**ProjectDetailPage - Progresso:**
- Remover `MOCK_PROGRESS`
- Calcular progresso real a partir dos stages: media ponderada de `stages.progress` para o projeto
- Se nao houver stages, mostrar 0%

---

### 4. Arquivos a Modificar

**Migracao SQL** (1 arquivo):
- Criar `project_members`, `project_invites`
- Adicionar colunas `weather` e `unit_price`
- Criar funcoes helper de RLS
- Criar trigger auto-membership
- Migrar owners existentes para project_members
- Dropar policies antigas, criar novas member-based
- Criar bucket `project-covers`

**`src/pages/HomePage.tsx`**:
- Remover import de mockActivities
- Adicionar useEffect/useQuery para buscar atividades reais
- Adaptar renderizacao para dados reais (sem userInitials mock)

**`src/pages/ProjectDetailPage.tsx`**:
- Remover mockMembers e MOCK_PROGRESS
- Adicionar queries para membros reais e progresso calculado
- Renderizar avatares reais

**`src/data/mockActivities.ts`**:
- Remover arquivo (nao sera mais usado)

**`src/hooks/useStages.ts`**:
- Adicionar funcao `calculateProgress` que retorna media dos stages.progress

**`src/stores/useAppStore.ts`**:
- Ja tem Activity interface, manter

---

### Detalhes Tecnicos

- **Trigger auto-membership**: `AFTER INSERT ON projects` cria automaticamente `project_members` com `profile_id = (SELECT id FROM profiles WHERE user_id = NEW.owner_id)` e `role = 'owner'`
- **Funcao is_project_member**: `SECURITY DEFINER` para evitar recursao RLS. Verifica se existe row em `project_members` com o `profile_id` correspondente ao `auth.uid()`
- **Progresso real**: `SELECT AVG(progress) FROM stages WHERE project_id = ?` - retorna 0 se nao houver stages
- **Feed de atividades**: Usa tabela `activities` ja existente. Os hooks existentes podem ser atualizados para inserir atividades ao criar RDOs, checklists, etc. (escopo futuro)
- **Perfil para membership**: Como `profiles.id` (uuid auto) != `auth.uid()`, o join precisa passar por `profiles.user_id = auth.uid()` para encontrar o profile_id correto

