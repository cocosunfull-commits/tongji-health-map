export interface LocationFeature {
  id: string;
  name: string;
  category: string;
  description: string;
  coordinates: [number, number]; // [lng, lat]
}

export type Category = 'all' | 'spaces for relaxation' | 'sports and fitness spaces' | 'healthy dining options' | 'mental health counseling services' | 'the campus clinic';
