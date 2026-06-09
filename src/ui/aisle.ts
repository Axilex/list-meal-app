// Classement des articles de courses par rayon de magasin, d'après le nom
// de l'ingrédient (mots-clés, insensible aux accents). Purement visuel :
// le domaine ne connaît pas les rayons ; en cas de doute → « Autres ».

export type AisleId =
  | 'produce'
  | 'butcher'
  | 'dairy'
  | 'bakery'
  | 'pantry'
  | 'spices'
  | 'other'

export interface Aisle {
  id: AisleId
  label: string
  emoji: string
}

/** Rayons dans l'ordre d'un parcours de magasin. */
export const AISLES: Aisle[] = [
  { id: 'produce', label: 'Fruits & légumes', emoji: '🥬' },
  { id: 'butcher', label: 'Viandes & poissons', emoji: '🥩' },
  { id: 'dairy', label: 'Crèmerie & œufs', emoji: '🥛' },
  { id: 'bakery', label: 'Boulangerie', emoji: '🥖' },
  { id: 'pantry', label: 'Épicerie', emoji: '🥫' },
  { id: 'spices', label: 'Épices & condiments', emoji: '🧂' },
  { id: 'other', label: 'Autres', emoji: '🛒' },
]

function normalize(value: string): string {
  // NFD ne décompose pas les ligatures : œ → oe à la main (« Bœuf », « Œuf »)
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/œ/g, 'oe')
}

// Première règle qui matche gagne : les cas particuliers (conserves,
// légumineuses sèches, pâtes fraîches…) passent avant les règles générales.
const RULES: Array<[AisleId, RegExp]> = [
  // Conserves et briques → épicerie, avant les règles « tomate », « lait »…
  ['pantry', /coulis|concentre|pelee|en boite|bouillon|conserve|lait de coco/],
  // Pâtes fraîches du commerce → crèmerie, avant « pate(s) » féculent
  ['dairy', /pate (feuilletee|brisee|sablee|a pizza)/],
  // Légumineuses sèches → épicerie, avant « pois » et « haricot » du primeur
  ['pantry', /pois chiche|lentille|haricot (rouge|blanc|noir)/],

  [
    'butcher',
    /\b(poulet|dinde|volaille|boeuf|steak|veau|agneau|canard|porc|lardon|jambon|chorizo|saucisse|merguez|saucisson|viande|saumon|cabillaud|thon|truite|colin|sardine|poisson|crevette|moule|gambas)s?\b/,
  ],
  [
    'dairy',
    /\b(lait|beurre|creme|yaourt|fromage|parmesan|mozzarella|feta|comte|gruyere|emmental|chevre|raclette|ricotta|mascarpone|oeuf)s?\b/,
  ],
  ['bakery', /\b(pain|baguette|brioche|croissant)s?\b/],
  [
    'produce',
    /\b(tomate|oignon|ail|echalote|carotte|patate|courgette|aubergine|poivron|brocoli|chou|poireau|concombre|salade|epinard|champignon|haricot|pois|avocat|celeri|fenouil|radis|navet|potiron|courge|citron|pomme|poire|banane|orange|fraise|framboise|myrtille|abricot|peche|raisin|kiwi|mangue|melon|gingembre|basilic|persil|coriandre|ciboulette|menthe|aneth|romarin|fruit|legume)s?\b/,
  ],
  // Avant l'épicerie : « huile d'olive » est un condiment, pas une olive
  [
    'spices',
    /\b(sel|poivre|paprika|cumin|curry|curcuma|cannelle|muscade|thym|laurier|origan|epice|herbes de provence|huile|vinaigre|moutarde|mayonnaise|ketchup|sauce|soja|tabasco|harissa)s?\b/,
  ],
  [
    'pantry',
    /\b(riz|pate|spaghetti|tagliatelle|penne|nouille|semoule|quinoa|boulgour|polenta|farine|sucre|levure|chocolat|miel|confiture|cereale|avoine|tortilla|wrap|olive|capre|cornichon|amande|noix|noisette|pignon|cacahuete|chips|biscuit)s?\b/,
  ],
]

export function aisleOf(name: string): AisleId {
  const normalized = normalize(name)
  return RULES.find(([, pattern]) => pattern.test(normalized))?.[0] ?? 'other'
}

/** Groupe des articles par rayon, dans l'ordre des AISLES, rayons vides omis. */
export function groupByAisle<T extends { name: string }>(
  items: T[],
): Array<{ aisle: Aisle; items: T[] }> {
  const byAisle = new Map<AisleId, T[]>()
  for (const item of items) {
    const id = aisleOf(item.name)
    const bucket = byAisle.get(id)
    if (bucket) bucket.push(item)
    else byAisle.set(id, [item])
  }
  return AISLES.flatMap((aisle) => {
    const grouped = byAisle.get(aisle.id)
    return grouped ? [{ aisle, items: grouped }] : []
  })
}
