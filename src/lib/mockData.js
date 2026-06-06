// Mock data for development – reemplazar con Firestore en producción

export const MOCK_MENUS = [
  {
    week_id: '2026-W24',
    status: 'published',
    release_date: new Date('2026-06-06T10:00:00'),
    sections: {
      estrella: 'Wok de pollo con brócoli y arroz integral',
      yapa: 'Aderezo de sésamo y jengibre casero',
      comodin: 'Huevos revueltos con espinaca',
      tips_nutriarte: 'Incorporar brócoli 3 veces por semana ayuda a cubrir vitamina C y K diaria.',
    },
    days: [
      {
        day: 'Lunes',
        emoji: '🥗',
        title: 'Ensalada César con pollo grillado',
        description: 'Versión saludable del clásico con aderezo de yogur.',
        ingredients_omni: ['Pechuga de pollo 200g', 'Lechuga romana', 'Pan integral tostado', 'Yogur griego', 'Limón', 'Ajo', 'Parmesano'],
        ingredients_veggie: ['Garbanzos 150g', 'Lechuga romana', 'Pan integral tostado', 'Yogur griego', 'Limón', 'Ajo', 'Parmesano'],
        steps: [
          'Grillá el pollo con sal, pimienta y ajo 5 min por lado.',
          'Preparar aderezo: mezclá yogur, limón, ajo rallado y parmesano.',
          'Cortá la lechuga, tostá el pan y armá la ensalada.',
        ],
        steps_veggie: [
          'Cocí los garbanzos o usá de lata (enjuagados).',
          'Salteá con ajo, pimentón y sal.',
          'Armá la ensalada igual que la versión omní.',
        ],
        tip: 'El yogur griego tiene el doble de proteínas que el yogur común.',
        time_minutes: 20,
      },
      {
        day: 'Martes',
        emoji: '🍲',
        title: 'Lentejas estofadas con vegetales',
        description: 'Plato potente en hierro y fibra, listo en 25 minutos.',
        ingredients_omni: ['Lentejas 150g', 'Zanahoria', 'Apio', 'Tomate', 'Cebolla', 'Chorizo colorado 50g', 'Caldo de verduras'],
        ingredients_veggie: ['Lentejas 150g', 'Zanahoria', 'Apio', 'Tomate', 'Cebolla', 'Pimentón ahumado', 'Caldo de verduras'],
        steps: [
          'Sofreí cebolla, zanahoria y apio.',
          'Incorporá tomate, chorizo y lentejas.',
          'Cubrí con caldo y cocinà 20 min.',
        ],
        steps_veggie: [
          'Sofreí cebolla, zanahoria y apio.',
          'Incorporá tomate, pimentón y lentejas.',
          'Cubrí con caldo y cocinà 20 min.',
        ],
        tip: 'Acompañar con vitamina C (limón o tomate) potencia la absorción de hierro vegetal.',
        time_minutes: 25,
      },
      {
        day: 'Miércoles',
        emoji: '🐟',
        title: 'Salmón al horno con batata y espárragos',
        description: 'Proteína de alta calidad con omega-3 y antioxidantes.',
        ingredients_omni: ['Salmón 200g', 'Batata', 'Espárragos', 'Aceite de oliva', 'Ajo', 'Limón', 'Romero'],
        ingredients_veggie: ['Tofu firme 200g', 'Batata', 'Espárragos', 'Aceite de oliva', 'Ajo', 'Limón', 'Romero'],
        steps: [
          'Cortá la batata en cubos y los espárragos al medio.',
          'Colocá todo en asadera con aceite, ajo y romero.',
          'Hornear 200°C por 25 min, el salmón los últimos 12 min.',
        ],
        steps_veggie: [
          'Marinà el tofu en limón, ajo y soja por 15 min.',
          'Colocá junto a batata y espárragos en asadera.',
          'Hornear 200°C por 30 min.',
        ],
        tip: 'El omega-3 del salmón reduce inflamación y mejora el perfil lipídico.',
        time_minutes: 35,
      },
      {
        day: 'Jueves',
        emoji: '🥙',
        title: 'Wraps de pavo y palta',
        description: 'Rápidos, saciantes y llenos de grasas saludables.',
        ingredients_omni: ['Pechuga de pavo 150g', 'Palta', 'Rúcula', 'Tomate cherry', 'Tortilla integral x2', 'Mostaza dijon'],
        ingredients_veggie: ['Hummus 80g', 'Palta', 'Rúcula', 'Tomate cherry', 'Tortilla integral x2', 'Zanahoria rallada'],
        steps: [
          'Cortar el pavo en tiras y salteá 5 min.',
          'Untar la tortilla con mostaza.',
          'Armar con todos los ingredientes y enrollar.',
        ],
        steps_veggie: [
          'Untar la tortilla generosamente con hummus.',
          'Agregar palta en rodajas, rúcula, tomate y zanahoria.',
          'Enrollar y servir.',
        ],
        tip: 'La palta aporta grasas monoinsaturadas que ayudan a absorber vitaminas liposolubles.',
        time_minutes: 15,
      },
      {
        day: 'Viernes',
        emoji: '🍝',
        title: 'Pasta integral con pesto de espinaca',
        description: 'Cierre de semana verde, cremoso y lleno de nutrientes.',
        ingredients_omni: ['Pasta integral 150g', 'Espinaca fresca 2 tazas', 'Parmesano 30g', 'Piñones', 'Ajo 1 diente', 'Aceite de oliva', 'Pollo grillado opcional'],
        ingredients_veggie: ['Pasta integral 150g', 'Espinaca fresca 2 tazas', 'Levadura nutricional 2 cdas', 'Piñones', 'Ajo 1 diente', 'Aceite de oliva'],
        steps: [
          'Cocinar la pasta según instrucciones.',
          'Procesar espinaca, ajo, parmesano, piñones y aceite.',
          'Mezclar pesto con la pasta y servir.',
        ],
        steps_veggie: [
          'Cocinar la pasta según instrucciones.',
          'Procesar espinaca, ajo, levadura nutricional, piñones y aceite.',
          'Mezclar pesto con la pasta y servir.',
        ],
        tip: 'La levadura nutricional es la alternativa vegana al queso con sabor umami y vitamina B12.',
        time_minutes: 20,
      },
    ],
    shopping_list: {
      omnivora: {
        verduleria: ['Lechuga romana', 'Brócoli', 'Zanahoria 2u', 'Apio', 'Tomate 3u', 'Cebolla', 'Batata', 'Espárragos', 'Palta 2u', 'Rúcula', 'Tomate cherry', 'Espinaca fresca'],
        carniceria: ['Pechuga de pollo 600g', 'Chorizo colorado 50g', 'Salmón 200g', 'Pechuga de pavo 150g'],
        almacen: ['Pan integral', 'Yogur griego', 'Lentejas 150g', 'Pasta integral 150g', 'Piñones', 'Parmesano', 'Tortilla integral x4', 'Mostaza dijon', 'Aceite de oliva', 'Caldo de verduras'],
      },
      vegetariana: {
        verduleria: ['Lechuga romana', 'Brócoli', 'Zanahoria 2u', 'Apio', 'Tomate 3u', 'Cebolla', 'Batata', 'Espárragos', 'Palta 2u', 'Rúcula', 'Tomate cherry', 'Espinaca fresca'],
        carniceria: [],
        almacen: ['Pan integral', 'Yogur griego', 'Garbanzos en lata', 'Lentejas 150g', 'Tofu firme 200g', 'Hummus 80g', 'Pasta integral 150g', 'Piñones', 'Levadura nutricional', 'Tortilla integral x4', 'Aceite de oliva', 'Caldo de verduras'],
      },
    },
  },
]

export const PLANS = [
  {
    id: 'mensual',
    name: 'Plan Mensual',
    price: 4500,
    currency: 'ARS',
    period: '/mes',
    features: [
      'Menú semanal de lunes a viernes',
      'Receta alternativa vegetariana cada día',
      'Lista de compras interactiva',
      'Tips nutricionales de Nutriarte',
      'Acceso a menús anteriores',
    ],
    highlight: true,
  },
]
