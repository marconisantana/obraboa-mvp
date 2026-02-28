

## Calculadora de Rendimentos - Aba Ferramentas

### Resumo

Transformar a tela de Ferramentas (atualmente placeholder "Em breve") em uma calculadora de rendimentos de materiais de construcao. Tela 100% frontend, sem banco de dados, com selecao de material e calculos baseados em formulas padrao ABNT.

---

### 1. Estrutura da tela

A `ToolsPage` sera reescrita com:

1. **Header** com titulo "Ferramentas" e subtitulo "Calculadora de Rendimentos"
2. **Grid de selecao de material** (6 cards com icone visual):
   - Ceramica/Porcelanato (Grid3x3)
   - Argamassa (Layers)
   - Rejunte (SquareDashed ou similar)
   - Tinta (Paintbrush)
   - Cimento (Package)
   - Massa corrida (PaintRoller)
3. **Formulario dinamico** que muda conforme o material selecionado
4. **Area de resultado** com calculo e sugestao de compra
5. **Botao "Nova Calculadora"** para reiniciar

---

### 2. Inputs por material

**Ceramica/Porcelanato:**
- Area (m2) - input numerico
- Perda (%) - input numerico, padrao 10
- Tamanho da peca - select: 30x30, 45x45, 60x60, 80x80, 20x20 cm

**Argamassa:**
- Area (m2)
- Tipo - select: AC-I, AC-II, AC-III

**Rejunte:**
- Area (m2)
- Largura da junta (mm) - input numerico, padrao 3

**Tinta:**
- Area (m2)
- Numero de demaos - select: 1, 2, 3
- Tipo de tinta - select: Latex, Textura, Esmalte

**Cimento:**
- Volume (m3)
- Traco - select: 1:2:3, 1:3:4, 1:2:4

**Massa corrida:**
- Area (m2)
- Numero de demaos - select: 1, 2, 3

---

### 3. Formulas de rendimento

Todas baseadas em referencias padrao ABNT / mercado:

- **Ceramica**: `pecas = (area * (1 + perda/100)) / areaPeca`. Resultado em m2 de piso + quantidade de caixas (arredondado para cima).
- **Argamassa**: Rendimento medio por m2 conforme tipo (AC-I: ~5kg/m2, AC-II: ~5.5kg/m2, AC-III: ~5.5kg/m2). Resultado em kg, convertido para sacos de 20kg.
- **Rejunte**: Formula baseada em area, largura da junta e espessura da peca. Rendimento medio ~0.5-1kg/m2. Resultado em kg, convertido para sacos de 1kg ou 5kg.
- **Tinta**: Rendimento medio por tipo (Latex: ~10m2/L, Textura: ~4m2/kg, Esmalte: ~8m2/L). Multiplicar por demaos. Resultado em litros ou kg, convertido para latas de 18L ou galoes de 3.6L.
- **Cimento**: Baseado no traco. Traco 1:2:3 = ~7 sacos de 50kg por m3 de concreto. Resultado em sacos de 50kg.
- **Massa corrida**: Rendimento medio ~5m2/L por demao. Resultado em litros, convertido para latas de 18L.

Margem de seguranca sugerida: +10% sobre o calculado.

---

### 4. Output

Card de resultado com:
- Quantidade calculada (ex: "150 kg de argamassa AC-II")
- Quantidade sugerida para compra com margem (ex: "~8 sacos de 20kg")
- Unidade de medida claramente indicada
- Alerta em tom informativo: "Verifique sempre o rendimento indicado na embalagem do fabricante"

---

### 5. Traducoes (i18n)

Novas chaves `tools` em `pt-BR.json` e `en-US.json`:

```text
"tools": {
  "title": "Ferramentas",
  "yieldCalculator": "Calculadora de Rendimentos",
  "selectMaterial": "Selecione o material",
  "ceramic": "Ceramica/Porcelanato",
  "mortar": "Argamassa",
  "grout": "Rejunte",
  "paint": "Tinta",
  "cement": "Cimento",
  "putty": "Massa corrida",
  "area": "Area (m2)",
  "volume": "Volume (m3)",
  "wastePct": "Perda (%)",
  "tileSize": "Tamanho da peca",
  "mortarType": "Tipo de argamassa",
  "jointWidth": "Largura da junta (mm)",
  "coats": "Numero de demaos",
  "paintType": "Tipo de tinta",
  "mixRatio": "Traco",
  "calculate": "Calcular",
  "result": "Resultado",
  "calculatedQty": "Quantidade calculada",
  "suggestedPurchase": "Sugestao de compra",
  "unit": "Unidade",
  "newCalculation": "Nova Calculadora",
  "disclaimer": "Verifique sempre o rendimento indicado na embalagem do fabricante",
  "bags": "sacos",
  "liters": "litros",
  "cans": "latas",
  "sqMeters": "m2",
  "latex": "Latex",
  "texture": "Textura",
  "enamel": "Esmalte",
  "safetyMargin": "inclui margem de 10%"
}
```

---

### Detalhes Tecnicos

- **Sem banco de dados**: Tudo no frontend, sem persistencia. State local com `useState`.
- **Componente unico**: Criar `src/components/tools/YieldCalculator.tsx` com toda a logica de calculo e formulario.
- **ToolsPage.tsx**: Reescrever para renderizar o `YieldCalculator`.
- **Formulas**: Objeto de configuracao com rendimentos por material e tipo, facilitando manutencao.
- **Formatacao**: Numeros com `toFixed(1)` ou `Math.ceil` para quantidades inteiras (sacos, latas).
- **Responsividade**: Grid de materiais 2x3 em mobile, 3x2 em desktop.

### Arquivos a criar
- `src/components/tools/YieldCalculator.tsx`

### Arquivos a modificar
- `src/pages/ToolsPage.tsx` (renderizar YieldCalculator)
- `public/locales/pt-BR.json` (novas chaves tools)
- `public/locales/en-US.json` (novas chaves tools)
