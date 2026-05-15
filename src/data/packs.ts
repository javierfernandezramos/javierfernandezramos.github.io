export interface Pack {
    id: string;
    name: string;
    price: number;
    priceLabel?: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    bonus?: string;
}

export interface ServicePacks {
    id: string;
    title: string;
    packs: Pack[];
}

export const servicesPacks: Record<string, ServicePacks> = {
    deportes: {
        id: 'deportes',
        title: 'Fotografía Deportiva',
        packs: [
            {
                id: 'quick-action',
                name: 'Quick Action',
                price: 90,
                priceLabel: '90 € - 110 €',
                description: 'Ideal para sesiones cortas e intensas.',
                features: [
                    '20 fotos con revelado de color y luz',
                    '5 fotos con edición profesional avanzada',
                    'Entrega en galería digital privada'
                ]
            },
            {
                id: 'full-performance',
                name: 'Full Performance',
                price: 160,
                priceLabel: '160 € - 190 €',
                description: 'El equilibrio perfecto entre cantidad y calidad.',
                isPopular: true,
                bonus: '+5 fotos editadas extra gratis',
                features: [
                    '40 fotos con revelado de color y luz',
                    '15 fotos con edición profesional avanzada',
                    'Total: 45 fotos brutales para lucir en redes'
                ]
            },
            {
                id: 'event-team',
                name: 'Event / Team Coverage',
                price: 250,
                priceLabel: 'Desde 250 €',
                description: 'Cobertura completa para clubes o eventos.',
                features: [
                    'Toda la galería seleccionada (80-100 fotos)',
                    '20 fotos "High-End" para prensa o cartelería',
                    'Entrega en 3-7 días'
                ]
            }
        ]
    },
    retratos: {
        id: 'retratos',
        title: 'Retratos Profesionales',
        packs: [
            {
                id: 'retrato-express',
                name: 'Sesión Express',
                price: 90,
                priceLabel: '90 € - 110 €',
                description: 'Perfecto para actualizar tu perfil profesional.',
                features: [
                    '15 fotos con revelado de color y luz',
                    '3 fotos con retoque avanzado',
                    'Entrega en galería digital privada'
                ]
            },
            {
                id: 'retrato-pro',
                name: 'Pro Portfolio',
                price: 160,
                priceLabel: '160 € - 190 €',
                description: 'Sesión completa para modelos o profesionales.',
                isPopular: true,
                bonus: '+3 retoques extra gratis',
                features: [
                    '30 fotos con revelado de color y luz',
                    '10 fotos con retoque avanzado',
                    'Cambio de outfit incluido'
                ]
            },
            {
                id: 'retrato-editorial',
                name: 'Editorial / Brand',
                price: 250,
                priceLabel: 'Desde 250 €',
                description: 'Producción de alta gama para marcas o personalidades.',
                features: [
                    '60+ fotos con revelado de color y luz',
                    '20 fotos "High-End"',
                    'Dirección artística completa'
                ]
            }
        ]
    },
    eventos: {
        id: 'eventos',
        title: 'Eventos',
        packs: [
            {
                id: 'evento-esencial',
                name: 'Essential Event',
                price: 100,
                priceLabel: '100 € - 120 €',
                description: 'Cobertura básica para eventos cortos.',
                features: [
                    '1 hora de cobertura',
                    '30 fotos seleccionadas y reveladas',
                    'Entrega rápida (48h)'
                ]
            },
            {
                id: 'evento-full',
                name: 'Full Coverage',
                price: 180,
                priceLabel: '180 € - 220 €',
                description: 'Cobertura detallada de tu evento.',
                isPopular: true,
                bonus: 'Highlight video de 15 seg. gratis',
                features: [
                    '3 horas de cobertura',
                    '70+ fotos con revelado profesional',
                    '10 fotos con edición avanzada'
                ]
            },
            {
                id: 'evento-premium',
                name: 'Premium Event',
                price: 300,
                priceLabel: 'Desde 300 €',
                description: 'Cobertura total sin límites.',
                features: [
                    'Toda la jornada (hasta 6h)',
                    'Galería completa revelada',
                    'Reportaje narrativo completo'
                ]
            }
        ]
    },
    branding: {
        id: 'branding',
        title: 'Marca Personal / Branding',
        packs: [
            {
                id: 'branding-quick',
                name: 'Quick Start',
                price: 90,
                priceLabel: '90 € - 110 €',
                description: 'Lo esencial para tus redes sociales.',
                features: [
                    '15 fotos estratégicas',
                    'Optimización para LinkedIn e Instagram',
                    'Entrega en 3 días'
                ]
            },
            {
                id: 'branding-story',
                name: 'Brand Story',
                price: 200,
                priceLabel: '200 € - 240 €',
                description: 'Crea una identidad visual coherente.',
                isPopular: true,
                bonus: 'Plan de contenido visual incluido',
                features: [
                    '40 fotos con revelado pro',
                    'Contenido para 1 mes de redes',
                    '5 fotos con retoque avanzado'
                ]
            },
            {
                id: 'branding-total',
                name: 'Total Identity',
                price: 350,
                priceLabel: 'Desde 350 €',
                description: 'Transformación visual completa de tu marca.',
                features: [
                    'Sesión estratégica profunda',
                    '80+ fotos corporativas y lifestyle',
                    'Video presentación de 30 seg.'
                ]
            }
        ]
    },
    fitness: {
        id: 'fitness',
        title: 'Fotografía Fitness',
        packs: [
            {
                id: 'fitness-express',
                name: 'Glow Session',
                price: 90,
                priceLabel: '90 € - 110 €',
                description: 'Ideal para creadores de contenido y perfiles fitness.',
                features: [
                    '15 fotos con revelado de color y luz',
                    '3 fotos con edición avanzada (piel y luces)',
                    'Entrega en galería digital privada'
                ]
            },
            {
                id: 'fitness-pro',
                name: 'Athlete Portfolio',
                price: 160,
                priceLabel: '160 € - 190 €',
                description: 'La sesión definitiva para mostrar tu progreso.',
                isPopular: true,
                bonus: '+1 Reel corto de regalo',
                features: [
                    '30 fotos con revelado de color y luz',
                    '10 fotos con edición avanzada "High-End"',
                    'Cambio de outfit y localización (Gym/Exterior)'
                ]
            },
            {
                id: 'fitness-branding',
                name: 'Coach / Gym Brand',
                price: 280,
                priceLabel: 'Desde 280 €',
                description: 'Contenido profesional para entrenadores y gimnasios.',
                features: [
                    '60+ fotos seleccionadas',
                    'Reportaje narrativo del entrenamiento',
                    '2 Reels editados listos para publicar'
                ]
            }
        ]
    }
};
