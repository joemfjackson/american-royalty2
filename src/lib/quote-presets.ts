export interface QuotePreset {
  key: string
  label: string
  description: string
  defaultPrice: number | null // null = calculate from vehicle
  isPercentage: boolean
  percentOf?: 'subtotal'
  percentValue?: number
}

export const QUOTE_PRESETS: QuotePreset[] = [
  {
    key: 'vehicle_rental',
    label: 'Vehicle Rental',
    description: 'Vehicle Rental',
    defaultPrice: null,
    isPercentage: false,
  },
  {
    key: 'gratuity',
    label: 'Gratuity (20%)',
    description: 'Chauffeur Gratuity (20%)',
    defaultPrice: null,
    isPercentage: true,
    percentOf: 'subtotal',
    percentValue: 20,
  },
  {
    key: 'fuel_surcharge',
    label: 'Fuel Surcharge',
    description: 'Fuel Surcharge',
    defaultPrice: 50,
    isPercentage: false,
  },
  {
    key: 'red_carpet',
    label: 'Red Carpet',
    description: 'Red Carpet Service',
    defaultPrice: 75,
    isPercentage: false,
  },
  {
    key: 'decorations',
    label: 'Decorations',
    description: 'Custom Decorations Package',
    defaultPrice: 150,
    isPercentage: false,
  },
  {
    key: 'champagne',
    label: 'Champagne',
    description: 'Champagne Package',
    defaultPrice: 100,
    isPercentage: false,
  },
  {
    key: 'ice_cooler',
    label: 'Ice & Cooler',
    description: 'Ice & Cooler Service',
    defaultPrice: 25,
    isPercentage: false,
  },
  {
    key: 'extra_stop',
    label: 'Extra Stop',
    description: 'Additional Stop',
    defaultPrice: 50,
    isPercentage: false,
  },
  {
    key: 'overtime',
    label: 'Overtime',
    description: 'Overtime (per hour)',
    defaultPrice: null,
    isPercentage: false,
  },
]
