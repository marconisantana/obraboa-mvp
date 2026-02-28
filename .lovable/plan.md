

## Modulos Compras (OCs) e Dossies

### Resumo

Criar dois modulos completos: **Ordens de Compra** (criacao, listagem, exportacao PDF, compartilhamento) e **Dossies** (controle financeiro de fornecedores com parcelas, comprovantes e alertas visuais).

---

### 1. Banco de dados

**Tabela `purchase_orders`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| project_id | uuid | FK -> projects.id CASCADE | No |
| user_id | uuid | auth.uid() | No |
| order_number | text | - | No |
| supplier_name | text | - | No |
| supplier_contact | text | '' | Yes |
| observations | text | '' | Yes |
| status | text | 'draft' | No |
| created_at | timestamptz | now() | No |
| updated_at | timestamptz | now() | No |

**Tabela `purchase_order_items`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| order_id | uuid | FK -> purchase_orders.id CASCADE | No |
| description | text | - | No |
| quantity | numeric(10,2) | 1 | No |
| unit | text | 'un' | No |
| sort_order | integer | 0 | No |

**Tabela `dossiers`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| project_id | uuid | FK -> projects.id CASCADE | No |
| user_id | uuid | auth.uid() | No |
| name | text | - | No |
| supplier_name | text | '' | Yes |
| agreed_value | numeric(12,2) | 0 | No |
| additive_value | numeric(12,2) | 0 | No |
| observations | text | '' | Yes |
| created_at | timestamptz | now() | No |
| updated_at | timestamptz | now() | No |

**Tabela `dossier_payments`:**

| Coluna | Tipo | Default | Nullable |
|---|---|---|---|
| id | uuid | gen_random_uuid() | No |
| dossier_id | uuid | FK -> dossiers.id CASCADE | No |
| due_date | date | - | No |
| amount | numeric(12,2) | - | No |
| status | text | 'pending' | No |
| paid_date | date | null | Yes |
| receipt_path | text | null | Yes |
| created_at | timestamptz | now() | No |

**Storage bucket**: `dossier-receipts` (public) para comprovantes de pagamento.

**RLS**: Todas as tabelas com policies baseadas em `EXISTS (SELECT 1 FROM projects WHERE projects.id = <table>.project_id AND projects.owner_id = auth.uid())`. Para `purchase_order_items` e `dossier_payments`, join via tabela pai.

**Triggers**: `update_updated_at_column` em `purchase_orders` e `dossiers`.

**Funcao para numero auto**: Uma funcao SQL `generate_next_oc_number(project_uuid)` que retorna o proximo numero no formato `OC-001`, `OC-002`, etc., com base na contagem de OCs existentes do projeto.

---

### 2. Traducoes (i18n)

Novas chaves em `pt-BR.json` e `en-US.json`:

```text
"purchases": {
  "title": "Ordens de Compra",
  "new": "Nova OC",
  "edit": "Editar OC",
  "orderNumber": "Numero da OC",
  "supplierName": "Fornecedor",
  "supplierContact": "Contato (telefone/email)",
  "observations": "Observacoes",
  "items": "Itens",
  "addItem": "Adicionar item",
  "itemDescription": "Descricao",
  "quantity": "Qtd",
  "unit": "Unidade",
  "status": "Status",
  "draft": "Rascunho",
  "sent": "Enviada",
  "approved": "Aprovada",
  "received": "Recebida",
  "noPurchases": "Nenhuma OC cadastrada",
  "noPurchasesDesc": "Crie a primeira ordem de compra",
  "exportPdf": "Exportar PDF",
  "shareWhatsapp": "Enviar por WhatsApp",
  "shareEmail": "Enviar por e-mail",
  "deleteConfirm": "Tem certeza que deseja excluir esta OC?",
  "markSent": "Marcar como enviada",
  "selectProject": "Selecione um projeto para ver as OCs"
}

"dossiers": {
  "title": "Dossies",
  "new": "Novo Dossie",
  "edit": "Editar Dossie",
  "name": "Nome/Servico",
  "supplier": "Fornecedor",
  "agreedValue": "Valor acordado",
  "additiveValue": "Aditivo",
  "addAdditive": "Adicionar aditivo",
  "totalAgreed": "Total acordado",
  "totalPaid": "Total pago",
  "remaining": "Valor pendente",
  "observations": "Observacoes",
  "in_progress": "Em andamento",
  "settled": "Quitado",
  "exceeded": "Extrapolado",
  "noDossiers": "Nenhum dossie cadastrado",
  "nodossiersDesc": "Crie o primeiro dossie do projeto",
  "payments": "Pagamentos",
  "addPayment": "Adicionar pagamento",
  "dueDate": "Vencimento",
  "amount": "Valor",
  "paidDate": "Data de pagamento",
  "pending": "Pendente",
  "paid": "Pago",
  "overdue": "Atrasado",
  "markPaid": "Marcar como pago",
  "uploadReceipt": "Comprovante",
  "exceededWarning": "Atencao: valor pago (R$ {paid}) excede o acordado (R$ {agreed})",
  "deleteConfirm": "Tem certeza que deseja excluir este dossie?",
  "selectProject": "Selecione um projeto para ver os dossies",
  "progressLabel": "R$ {paid} de R$ {total}"
}
```

---

### 3. Hooks

**`src/hooks/usePurchaseOrders.ts`:**
- React Query + Supabase CRUD para `purchase_orders` e `purchase_order_items`
- `fetchOrders(projectId)`: lista com contagem de itens
- `fetchOrderDetail(orderId)`: OC completa com itens
- `createOrder`, `updateOrder`, `deleteOrder`
- `generateOrderNumber(projectId)`: busca contagem de OCs e retorna proximo numero
- Ao marcar como "enviada", atualiza status automaticamente

**`src/hooks/useDossiers.ts`:**
- React Query + Supabase CRUD para `dossiers` e `dossier_payments`
- `fetchDossiers(projectId)`: lista com soma de pagamentos para calcular status
- `fetchDossierDetail(dossierId)`: dossie completo com pagamentos
- `createDossier`, `updateDossier`, `deleteDossier`
- `addPayment`, `markPaymentPaid`, `deletePayment`
- `uploadReceipt(paymentId, file)`: upload para bucket `dossier-receipts`
- Status calculado no frontend: comparando soma dos pagamentos pagos vs valor acordado + aditivos

---

### 4. Componentes - Compras

**`src/components/purchases/PurchaseOrderCard.tsx`:**
- Numero da OC, fornecedor, data, badge de status (cinza/azul/verde/laranja)
- Contagem de itens
- Click navega para detalhe

**`src/components/purchases/PurchaseOrderForm.tsx`:**
- Dialog com campos: numero (auto-gerado, read-only), fornecedor, contato, observacoes
- Tabela dinamica de itens: descricao, qtd, unidade + botao adicionar/remover
- Validacao com zod

**`src/components/purchases/PurchaseOrderDetail.tsx`:**
- Cabecalho com numero, fornecedor, contato, status
- Tabela de itens
- Botoes: editar, exportar PDF, compartilhar WhatsApp/email, marcar como enviada
- Menu de exportacao similar ao RdoExportMenu

**`src/components/purchases/PurchaseOrderPrintView.tsx`:**
- Layout para impressao: logo ObraBoa, dados do projeto, tabela de itens formatada, observacoes
- CSS `@media print`

---

### 5. Componentes - Dossies

**`src/components/dossiers/DossierCard.tsx`:**
- Nome/fornecedor, valor acordado, valor pago, valor pendente
- Badge de status colorido (amarelo/verde/vermelho)
- Barra de progresso do valor pago

**`src/components/dossiers/DossierForm.tsx`:**
- Dialog com campos: nome, fornecedor, valor acordado, observacoes
- Opcao de programar pagamentos: lista dinamica de {data vencimento, valor}
- Validacao com zod

**`src/components/dossiers/DossierDetail.tsx`:**
- Cabecalho: fornecedor/servico, valor total acordado (incluindo aditivos), barra de progresso
- Botao "Adicionar aditivo" que incrementa o valor
- Banner vermelho se valor pago > acordado
- Lista de pagamentos com: data vencimento, valor, status badge, data pagamento
- Botao "Marcar como pago" em cada parcela pendente
- Upload de comprovante por parcela (foto/arquivo)
- Botao adicionar novo pagamento

**`src/components/dossiers/PaymentRow.tsx`:**
- Linha individual de pagamento
- Badge de status: pendente (cinza), pago (verde), atrasado (vermelho - vencimento < hoje e nao pago)
- Botao marcar pago, botao upload comprovante, preview do comprovante

---

### 6. Paginas

**`src/pages/PurchasesPage.tsx`:**
- Sem projeto ativo: mensagem pedindo selecionar
- Lista de OCs ordenada por created_at desc
- Botao "+ Nova OC"

**`src/pages/PurchaseOrderDetailPage.tsx`:**
- Renderiza PurchaseOrderDetail com dados do hook

**`src/pages/DossiersPage.tsx`:**
- Sem projeto ativo: mensagem pedindo selecionar
- Lista de dossies ordenada por updated_at desc
- Botao "+ Novo Dossie"

**`src/pages/DossierDetailPage.tsx`:**
- Renderiza DossierDetail com dados do hook

---

### 7. Roteamento

Adicionar em `App.tsx`:
- `/purchases` - PurchasesPage
- `/purchases/:id` - PurchaseOrderDetailPage
- `/dossiers` - DossiersPage
- `/dossiers/:id` - DossierDetailPage

Atualizar `ProjectDetailPage`: atalhos "Compras" e "Dossies" navegam para as respectivas rotas.

---

### Detalhes Tecnicos

- **Numero auto OC**: Query `SELECT COUNT(*) FROM purchase_orders WHERE project_id = ?`, formata como `OC-${(count+1).toString().padStart(3, '0')}`.
- **Status dossie calculado**: `totalPaid = SUM(pagamentos com status='paid')`. Se `totalPaid >= agreedValue + additiveValue` -> "Quitado". Se `totalPaid > agreedValue + additiveValue` -> "Extrapolado". Senao -> "Em andamento".
- **Pagamento atrasado**: `due_date < today AND status = 'pending'` - calculado no frontend.
- **Upload comprovante**: Bucket `dossier-receipts`, path `{dossier_id}/{payment_id}/{uuid}.ext`.
- **Exportacao PDF (OC)**: Mesma abordagem do RDO - componente `PurchaseOrderPrintView` com CSS `@media print` + `window.print()`. Compartilhamento via Web Share API / links WhatsApp/email com texto resumido.
- **Formatacao monetaria**: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

### Arquivos a criar
- Migracao SQL (4 tabelas + bucket + RLS + triggers)
- `src/hooks/usePurchaseOrders.ts`
- `src/hooks/useDossiers.ts`
- `src/components/purchases/PurchaseOrderCard.tsx`
- `src/components/purchases/PurchaseOrderForm.tsx`
- `src/components/purchases/PurchaseOrderDetail.tsx`
- `src/components/purchases/PurchaseOrderPrintView.tsx`
- `src/components/dossiers/DossierCard.tsx`
- `src/components/dossiers/DossierForm.tsx`
- `src/components/dossiers/DossierDetail.tsx`
- `src/components/dossiers/PaymentRow.tsx`
- `src/pages/PurchasesPage.tsx`
- `src/pages/PurchaseOrderDetailPage.tsx`
- `src/pages/DossiersPage.tsx`
- `src/pages/DossierDetailPage.tsx`

### Arquivos a modificar
- `src/App.tsx` (novas rotas)
- `src/pages/ProjectDetailPage.tsx` (atalhos navegam para /purchases e /dossiers)
- `public/locales/pt-BR.json` (novas chaves purchases + dossiers)
- `public/locales/en-US.json` (novas chaves purchases + dossiers)

