// Identité visuelle d'une recette : teinte bonbon + emoji, dérivés de son
// nom (déterministes : même nom → même couleur, même emoji partout).

export interface RecipeVisual {
  emoji: string
  accent: string
  soft: string
  border: string
  text: string
}

const PALETTES: Omit<RecipeVisual, 'emoji'>[] = [
  { accent: '#f5503c', soft: '#ffe9e5', border: '#ffb3a6', text: '#a8281a' }, // tomate
  { accent: '#ff8a1e', soft: '#fff0db', border: '#ffcf8f', text: '#9e5400' }, // carotte
  { accent: '#ffc21e', soft: '#fff6d6', border: '#ffe18a', text: '#8a6200' }, // miel
  { accent: '#1fc79e', soft: '#dcfbf2', border: '#8fe9d3', text: '#0a6e58' }, // menthe
  { accent: '#8fcf3a', soft: '#eefcd6', border: '#cdee94', text: '#4f7a12' }, // kiwi
  { accent: '#2fa4f5', soft: '#e0f1ff', border: '#a3d6ff', text: '#0f5e9e' }, // ciel
  { accent: '#9a6bff', soft: '#efe6ff', border: '#cdb6ff', text: '#5a2fc0' }, // lavande
  { accent: '#ff5fa2', soft: '#ffe4f0', border: '#ffb0d2', text: '#b02560' }, // rose
]

const EMOJIS = [
  '🍅', '🥕', '🍋', '🥦', '🫐', '🍆', '🥑', '🍄',
  '🌽', '🫑', '🧀', '🍤', '🍗', '🥔', '🌶️', '🍝',
]

// Emoji choisi d'après le nom (premier mot-clé trouvé) ; hash en repli.
const EMOJI_KEYWORDS: [string[], string][] = [
  [['risotto', 'riz'], '🍚'],
  [['pates', 'spaghetti', 'carbonara', 'bolognaise', 'lasagne'], '🍝'],
  [['pizza'], '🍕'],
  [['salade'], '🥗'],
  [['soupe', 'veloute', 'potage'], '🍲'],
  [['curry'], '🍛'],
  [['poulet', 'dinde'], '🍗'],
  [['boeuf', 'steak'], '🥩'],
  [['poisson', 'saumon', 'thon', 'cabillaud'], '🐟'],
  [['crevette'], '🍤'],
  [['oeuf', 'omelette'], '🍳'],
  [['tarte', 'quiche'], '🥧'],
  [['burger'], '🍔'],
  [['taco', 'burrito'], '🌮'],
  [['crepe', 'galette'], '🥞'],
  [['gratin'], '🥘'],
  [['sandwich', 'wrap'], '🥪'],
  [['sushi'], '🍣'],
  [['tomate'], '🍅'],
  [['champignon'], '🍄'],
  [['fromage', 'raclette'], '🧀'],
]

function normalize(value: string): string {
  // NFD + retrait des diacritiques combinants : « pâtes » → « pates »
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function hashCode(value: string): number {
  let hash = 5381
  for (let i = 0; i < value.length; i++) {
    hash = ((hash * 33) ^ value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function recipeVisual(name: string): RecipeVisual {
  const normalized = normalize(name)
  const hash = hashCode(normalized)
  const palette = PALETTES[hash % PALETTES.length]
  const keywordEmoji = EMOJI_KEYWORDS.find(([words]) =>
    words.some((w) => normalized.includes(w)),
  )?.[1]
  const emoji =
    keywordEmoji ?? EMOJIS[Math.floor(hash / PALETTES.length) % EMOJIS.length]
  return { emoji, ...palette }
}
