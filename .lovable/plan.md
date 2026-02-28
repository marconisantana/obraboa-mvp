

## ObraBoa — Fase 1: Fundação + Autenticação + Gestão de Projetos

### 1. Tema e Identidade Visual
- Configurar Tailwind com as cores do ObraBoa (primária #1B3A5C, destaque #F59E0B, superfícies, textos, sucesso, alerta)
- Fonte Inter (Google Fonts) com os pesos 400, 500, 600, 700
- Estilo de cards com border-radius 16px, sombras suaves, visual clean e minimalista
- Logo SVG placeholder no header (capacete mobile / logotipo completo desktop)

### 2. Layout Mobile-First
- **Bottom Navigation** fixa com 5 abas: Início (feed), Projetos, Cronograma, Documentos, Perfil
- Safe area padding para iOS (env(safe-area-inset-bottom))
- Touch targets mínimo 44×44px
- Layout responsivo: coluna única no mobile, sidebar colapsável em tablets, sidebar fixa no desktop
- FAB (Floating Action Button) para ações rápidas

### 3. Internacionalização (i18n)
- Configurar react-i18next com arquivo `/locales/pt-BR.json`
- Toda a interface em PT-BR desde o início
- Preparar estrutura para `/locales/en-US.json` futuro
- Datas em DD/MM/YYYY, moeda R$ (BRL)

### 4. Estado Global (Zustand)
- Store com user, activeProject, projects, plan e activities
- Controle de acesso por feature (canAccessFeature)

### 5. Autenticação com Supabase
- Login com email/senha
- Cadastro com nome completo, email, senha e tipo de conta (Pessoal / Profissional)
- Google OAuth (preparado, requer configuração do usuário no Supabase)
- Reset de senha por email com tela dedicada
- Sessão persistente
- Tabela `profiles` com nome, avatar, tipo de conta
- Tela de perfil do usuário com edição

### 6. Gestão de Projetos (Obras)
- Tabela `projects` no Supabase com nome, endereço, status, data de início/fim, membros
- Tela de listagem de projetos com cards visuais (status, progresso)
- Criação e edição de projeto via bottom sheet
- Seleção de projeto ativo (contexto para os demais módulos)
- Feed de atividades básico por projeto (estrutura inicial)

### 7. Roteamento
- Rotas protegidas (requer autenticação)
- Rotas públicas: login, cadastro, reset de senha
- Navegação entre as 5 abas principais
- Rota de detalhe do projeto

---

**Próximas fases** (não incluídas agora):
- Fase 2: Cronograma de Serviços + RDO + Checklists
- Fase 3: Ordens de Compra (jsPDF) + Dossiês de Pagamento
- Fase 4: Documentos + Caderno de Referências + Calculadora + Feed completo

