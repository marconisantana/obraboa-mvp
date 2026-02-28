import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid3x3, Layers, SquareDashedBottom, Paintbrush, Package, PaintRoller, RotateCcw, Calculator, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type MaterialType = 'ceramic' | 'mortar' | 'grout' | 'paint' | 'cement' | 'putty';

interface CalculationResult {
  calculatedQty: string;
  suggestedPurchase: string;
  unit: string;
}

const TILE_SIZES: Record<string, number> = {
  '20x20': 0.04,
  '30x30': 0.09,
  '45x45': 0.2025,
  '60x60': 0.36,
  '80x80': 0.64,
};

const MORTAR_YIELD: Record<string, number> = {
  'AC-I': 5,
  'AC-II': 5.5,
  'AC-III': 5.5,
};

const PAINT_YIELD: Record<string, { yield: number; unit: string }> = {
  latex: { yield: 10, unit: 'L' },
  texture: { yield: 4, unit: 'kg' },
  enamel: { yield: 8, unit: 'L' },
};

const CEMENT_BAGS: Record<string, number> = {
  '1:2:3': 7,
  '1:3:4': 5,
  '1:2:4': 6,
};

const MATERIALS = [
  { key: 'ceramic' as const, icon: Grid3x3 },
  { key: 'mortar' as const, icon: Layers },
  { key: 'grout' as const, icon: SquareDashedBottom },
  { key: 'paint' as const, icon: Paintbrush },
  { key: 'cement' as const, icon: Package },
  { key: 'putty' as const, icon: PaintRoller },
];

export default function YieldCalculator() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<MaterialType | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Inputs
  const [area, setArea] = useState('');
  const [volume, setVolume] = useState('');
  const [wastePct, setWastePct] = useState('10');
  const [tileSize, setTileSize] = useState('60x60');
  const [mortarType, setMortarType] = useState('AC-II');
  const [jointWidth, setJointWidth] = useState('3');
  const [coats, setCoats] = useState('2');
  const [paintType, setPaintType] = useState('latex');
  const [mixRatio, setMixRatio] = useState('1:2:3');

  const reset = () => {
    setSelected(null);
    setResult(null);
    setArea('');
    setVolume('');
    setWastePct('10');
    setTileSize('60x60');
    setMortarType('AC-II');
    setJointWidth('3');
    setCoats('2');
    setPaintType('latex');
    setMixRatio('1:2:3');
  };

  const calculate = () => {
    const a = parseFloat(area) || 0;
    const v = parseFloat(volume) || 0;
    const margin = 1.1;

    switch (selected) {
      case 'ceramic': {
        const waste = parseFloat(wastePct) || 10;
        const pieceArea = TILE_SIZES[tileSize];
        const totalArea = a * (1 + waste / 100);
        const totalAreaWithMargin = totalArea * margin;
        const boxes = Math.ceil(totalAreaWithMargin); // ~1m² per box
        setResult({
          calculatedQty: `${totalArea.toFixed(1)} m²`,
          suggestedPurchase: `~${boxes} m² (${t('tools.safetyMargin')})`,
          unit: 'm²',
        });
        break;
      }
      case 'mortar': {
        const yieldPerM2 = MORTAR_YIELD[mortarType];
        const totalKg = a * yieldPerM2;
        const totalWithMargin = totalKg * margin;
        const bags = Math.ceil(totalWithMargin / 20);
        setResult({
          calculatedQty: `${totalKg.toFixed(1)} kg`,
          suggestedPurchase: `~${bags} ${t('tools.bags')} de 20kg (${t('tools.safetyMargin')})`,
          unit: 'kg',
        });
        break;
      }
      case 'grout': {
        const jw = parseFloat(jointWidth) || 3;
        const yieldPerM2 = 0.5 + (jw - 2) * 0.25; // ~0.5-1 kg/m²
        const totalKg = a * Math.max(yieldPerM2, 0.5);
        const totalWithMargin = totalKg * margin;
        const bags = Math.ceil(totalWithMargin / 5);
        setResult({
          calculatedQty: `${totalKg.toFixed(1)} kg`,
          suggestedPurchase: `~${bags} ${t('tools.bags')} de 5kg (${t('tools.safetyMargin')})`,
          unit: 'kg',
        });
        break;
      }
      case 'paint': {
        const c = parseInt(coats) || 2;
        const py = PAINT_YIELD[paintType];
        const totalQty = (a * c) / py.yield;
        const totalWithMargin = totalQty * margin;
        if (py.unit === 'L') {
          const cans18L = Math.ceil(totalWithMargin / 18);
          const gallons = Math.ceil(totalWithMargin / 3.6);
          setResult({
            calculatedQty: `${totalQty.toFixed(1)} ${t('tools.liters')}`,
            suggestedPurchase: `~${cans18L} ${t('tools.cans')} de 18L ou ~${gallons} galões de 3.6L (${t('tools.safetyMargin')})`,
            unit: 'L',
          });
        } else {
          const cans = Math.ceil(totalWithMargin / 25);
          setResult({
            calculatedQty: `${totalQty.toFixed(1)} kg`,
            suggestedPurchase: `~${cans} baldes de 25kg (${t('tools.safetyMargin')})`,
            unit: 'kg',
          });
        }
        break;
      }
      case 'cement': {
        const bagsPerM3 = CEMENT_BAGS[mixRatio];
        const totalBags = v * bagsPerM3;
        const totalWithMargin = Math.ceil(totalBags * margin);
        setResult({
          calculatedQty: `${totalBags.toFixed(1)} ${t('tools.bags')} de 50kg`,
          suggestedPurchase: `~${totalWithMargin} ${t('tools.bags')} de 50kg (${t('tools.safetyMargin')})`,
          unit: t('tools.bags'),
        });
        break;
      }
      case 'putty': {
        const c = parseInt(coats) || 2;
        const totalL = (a * c) / 5;
        const totalWithMargin = totalL * margin;
        const cans = Math.ceil(totalWithMargin / 18);
        setResult({
          calculatedQty: `${totalL.toFixed(1)} ${t('tools.liters')}`,
          suggestedPurchase: `~${cans} ${t('tools.cans')} de 18L (${t('tools.safetyMargin')})`,
          unit: 'L',
        });
        break;
      }
    }
  };

  const canCalculate = () => {
    if (!selected) return false;
    if (selected === 'cement') return parseFloat(volume) > 0;
    return parseFloat(area) > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('tools.title')}</h1>
        <p className="text-muted-foreground">{t('tools.yieldCalculator')}</p>
      </div>

      {/* Material Selection */}
      {!selected && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">{t('tools.selectMaterial')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MATERIALS.map(({ key, icon: Icon }) => (
              <Card
                key={key}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelected(key)}
              >
                <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
                  <Icon size={32} className="text-primary" />
                  <span className="text-sm font-medium text-center">{t(`tools.${key}`)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      {selected && !result && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t(`tools.${selected}`)}</CardTitle>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Area input - all except cement */}
            {selected !== 'cement' && (
              <div className="space-y-1.5">
                <Label>{t('tools.area')}</Label>
                <Input type="number" min="0" step="0.1" value={area} onChange={e => setArea(e.target.value)} placeholder="0" />
              </div>
            )}

            {/* Volume - cement only */}
            {selected === 'cement' && (
              <div className="space-y-1.5">
                <Label>{t('tools.volume')}</Label>
                <Input type="number" min="0" step="0.1" value={volume} onChange={e => setVolume(e.target.value)} placeholder="0" />
              </div>
            )}

            {/* Ceramic extras */}
            {selected === 'ceramic' && (
              <>
                <div className="space-y-1.5">
                  <Label>{t('tools.wastePct')}</Label>
                  <Input type="number" min="0" max="50" value={wastePct} onChange={e => setWastePct(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('tools.tileSize')}</Label>
                  <Select value={tileSize} onValueChange={setTileSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(TILE_SIZES).map(s => (
                        <SelectItem key={s} value={s}>{s} cm</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Mortar extras */}
            {selected === 'mortar' && (
              <div className="space-y-1.5">
                <Label>{t('tools.mortarType')}</Label>
                <Select value={mortarType} onValueChange={setMortarType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(MORTAR_YIELD).map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Grout extras */}
            {selected === 'grout' && (
              <div className="space-y-1.5">
                <Label>{t('tools.jointWidth')}</Label>
                <Input type="number" min="1" max="15" value={jointWidth} onChange={e => setJointWidth(e.target.value)} />
              </div>
            )}

            {/* Paint extras */}
            {selected === 'paint' && (
              <>
                <div className="space-y-1.5">
                  <Label>{t('tools.coats')}</Label>
                  <Select value={coats} onValueChange={setCoats}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['1', '2', '3'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('tools.paintType')}</Label>
                  <Select value={paintType} onValueChange={setPaintType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latex">{t('tools.latex')}</SelectItem>
                      <SelectItem value="texture">{t('tools.texture')}</SelectItem>
                      <SelectItem value="enamel">{t('tools.enamel')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Cement extras */}
            {selected === 'cement' && (
              <div className="space-y-1.5">
                <Label>{t('tools.mixRatio')}</Label>
                <Select value={mixRatio} onValueChange={setMixRatio}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(CEMENT_BAGS).map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Putty extras */}
            {selected === 'putty' && (
              <div className="space-y-1.5">
                <Label>{t('tools.coats')}</Label>
                <Select value={coats} onValueChange={setCoats}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['1', '2', '3'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button className="w-full" onClick={calculate} disabled={!canCalculate()}>
              <Calculator size={16} className="mr-2" />
              {t('tools.calculate')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('tools.result')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('tools.calculatedQty')}</p>
                <p className="text-xl font-bold text-foreground">{result.calculatedQty}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('tools.suggestedPurchase')}</p>
                <p className="text-lg font-semibold text-primary">{result.suggestedPurchase}</p>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info size={16} />
            <AlertDescription>{t('tools.disclaimer')}</AlertDescription>
          </Alert>

          <Button variant="outline" className="w-full" onClick={reset}>
            <RotateCcw size={16} className="mr-2" />
            {t('tools.newCalculation')}
          </Button>
        </div>
      )}
    </div>
  );
}
