import { subHours, subDays, subMinutes } from 'date-fns';

export interface MockActivity {
  id: string;
  userName: string;
  userInitials: string;
  type: 'rdo' | 'checklist' | 'schedule' | 'purchase_order';
  description: string;
  createdAt: Date;
}

const now = new Date();

export const mockActivities: MockActivity[] = [
  {
    id: '1',
    userName: 'Maria Silva',
    userInitials: 'MS',
    type: 'rdo',
    description: 'adicionou 3 fotos ao RDO de hoje',
    createdAt: subMinutes(now, 25),
  },
  {
    id: '2',
    userName: 'João Pereira',
    userInitials: 'JP',
    type: 'checklist',
    description: 'concluiu o Checklist de Hidráulica',
    createdAt: subHours(now, 2),
  },
  {
    id: '3',
    userName: 'Ana Costa',
    userInitials: 'AC',
    type: 'schedule',
    description: 'marcou "Alvenaria 2º andar" como concluída',
    createdAt: subHours(now, 5),
  },
  {
    id: '4',
    userName: 'Carlos Mendes',
    userInitials: 'CM',
    type: 'purchase_order',
    description: 'criou OC #042 — Cimento e Areia',
    createdAt: subDays(now, 1),
  },
  {
    id: '5',
    userName: 'Maria Silva',
    userInitials: 'MS',
    type: 'rdo',
    description: 'registrou condição climática: Ensolarado',
    createdAt: subDays(now, 1),
  },
  {
    id: '6',
    userName: 'João Pereira',
    userInitials: 'JP',
    type: 'schedule',
    description: 'adicionou etapa "Instalação elétrica" ao cronograma',
    createdAt: subDays(now, 2),
  },
];
