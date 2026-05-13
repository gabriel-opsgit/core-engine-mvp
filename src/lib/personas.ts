export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  personality: 'friendly' | 'resistant' | 'harsh' | 'interested';
  vapiAssistantId: string;
  avatar: string;
}

export const personas: Persona[] = [
  {
    id: 'marcos',
    name: 'Marcos Oliveira',
    role: 'CEO - TechFlow',
    description: 'Aberto a inovações, mas valoriza muito o tempo e relacionamentos. Gosta de conversas leves.',
    personality: 'friendly',
    vapiAssistantId: '072ed04d-8049-451a-ac5a-8fe568ebf6d5',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&h=256&auto=format&fit=crop',
  },
  {
    id: 'helena',
    name: 'Dra. Helena Souza',
    role: 'CFO - Indústrias Alfa',
    description: 'Focada em números e ROI. Vai questionar cada centavo e já tem soluções estabelecidas.',
    personality: 'resistant',
    vapiAssistantId: 'd909641c-4874-4c47-ae81-e44a25fb495e',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&h=256&auto=format&fit=crop',
  },
  {
    id: 'ricardo',
    name: 'Ricardo Mendes',
    role: 'Gerente de Logística',
    description: 'Direto, impaciente e sob pressão constante. Se você não for relevante em 10 segundos, ele desliga.',
    personality: 'harsh',
    vapiAssistantId: '1210a190-3e2b-4cd6-8960-553fd549cb39',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&auto=format&fit=crop',
  },
  {
    id: 'julia',
    name: 'Julia Lima',
    role: 'Head de Marketing',
    description: 'Está buscando soluções para escalar. Curiosa e faz perguntas profundas sobre a implementação.',
    personality: 'interested',
    vapiAssistantId: 'cfd0f553-5316-42b8-bb55-acc45e5ac7c8',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&h=256&auto=format&fit=crop',
  },
];
