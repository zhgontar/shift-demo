export type Item = {
  id: string
  title: string
  help?: string
}

export const E_ITEMS: Item[] = [
  { id: 'E1',  title: 'Climate change adaptation actions are planned and implemented (green infrastructure, heat mitigation).',
    help: 'Based on “Climate change and adaptation strategies” — implemented projects, training, integration in teaching.' },
  { id: 'E2',  title: 'Institution has an approved environmental/sustainability policy with defined objectives and review cycle.' },
  { id: 'E3',  title: 'Energy efficiency measures exist and are monitored (lighting/HVAC, smart metering, reduction targets).' },
  { id: 'E4',  title: 'Waste reduction & recycling programme is in place and tracked (including hazardous waste procedures).' },
  { id: 'E5',  title: 'Sustainable mobility is promoted (public transport incentives, bike facilities, e-mobility, commuting surveys).' },
  { id: 'E6',  title: 'Water consumption is monitored with reduction actions (leak detection, efficient fixtures, reuse/harvesting).' },
  { id: 'E7',  title: 'Green campus & biodiversity initiatives (green space ratio, planting events, habitats) are active and growing.' },
  { id: 'E8',  title: 'Green procurement: environmental criteria are embedded in purchasing policies and vendor selection.' },
  { id: 'E9',  title: 'GHG emissions inventory exists (Scopes as applicable) and targets/roadmap are defined.' },
  { id: 'E10', title: 'Sustainability topics are integrated in curricula/research/engagement (E-dimension mainstreaming).' },
  { id: 'E11', title: 'KPIs for Environmental area are defined and used; data is collected consistently and reviewed for decisions.' },
  { id: 'E12', title: 'Awareness and participation: regular campaigns/trainings engage students and staff in E initiatives.' },
]

// Na później:
export const S_ITEMS: Item[] = []
export const G_ITEMS: Item[] = []