

## Novo Bottom Navigation para ObraBoa

### Resumo

Substituir o `BottomNav.tsx` atual por um novo componente `BottomNavigation.tsx` com as 5 abas solicitadas, visual atualizado (fundo branco, cores navy/cinza, fonte Nunito 11px), e atualizar o Sidebar para manter consistencia.

---

### 1. Adicionar fonte Nunito

Adicionar import do Google Fonts Nunito no `src/index.css` (ao lado do Inter existente).

### 2. Atualizar traducoes

Modificar `pt-BR.json` e `en-US.json` com as novas chaves de navegacao:

```
"nav": {
  "home": "Inicio" / "Home",
  "projects": "Obras" / "Projects",
  "tools": "Ferramentas" / "Tools",
  "pending": "Pendencias" / "Pending",
  "profile": "Perfil" / "Profile"
}
```

### 3. Criar `src/components/BottomNavigation.tsx`

Novo componente com:
- **5 abas**: Inicio (Home), Obras (HardHat), Ferramentas (Wrench), Pendencias (CircleAlert), Perfil (User)
- **Visual**: fundo `#FFFFFF`, sombra no topo (`shadow-[0_-2px_10px_rgba(0,0,0,0.08)]`), altura 64px + safe-area
- **Cores**: ativa `#0D3259` (navy), inativa `#9CA3AF` (cinza)
- **Fonte label**: Nunito, 11px
- **Responsivo**: oculto acima de 768px (`md:hidden`)
- **Rotas**: `/` , `/projects`, `/tools`, `/pending`, `/profile`

### 4. Criar paginas placeholder

Criar `src/pages/ToolsPage.tsx` e `src/pages/PendingPage.tsx` com conteudo simples "Em breve".

### 5. Atualizar `AppLayout.tsx`

Substituir import de `BottomNav` por `BottomNavigation`.

### 6. Atualizar `App.tsx`

Adicionar rotas `/tools` e `/pending` dentro do bloco protegido.

### 7. Atualizar `Sidebar.tsx`

Sincronizar os itens de navegacao do Sidebar desktop com as mesmas 5 abas.

### 8. Remover `BottomNav.tsx`

Arquivo antigo pode ser removido.

---

### Detalhes Tecnicos

- **Icones Lucide**: `Home`, `HardHat`, `Wrench`, `CircleAlert`, `User`
- **Breakpoint**: `md:hidden` (768px) em vez do atual `lg:hidden` (1024px)
- **Safe area**: `padding-bottom: env(safe-area-inset-bottom)` via classe `.safe-bottom` ja existente
- **Fonte Nunito**: carregada via Google Fonts, aplicada apenas aos labels do bottom nav

### Arquivos a criar
- `src/components/BottomNavigation.tsx`
- `src/pages/ToolsPage.tsx`
- `src/pages/PendingPage.tsx`

### Arquivos a modificar
- `src/index.css` (adicionar Nunito)
- `public/locales/pt-BR.json` e `en-US.json` (novas chaves nav)
- `src/components/AppLayout.tsx` (trocar componente)
- `src/components/Sidebar.tsx` (sincronizar abas)
- `src/App.tsx` (novas rotas)

### Arquivos a remover
- `src/components/BottomNav.tsx`

