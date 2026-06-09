import type { Ingredient, Unit } from '@/domain/models'

// Liste préremplie d'ingrédients courants. Fusionnée dans le stockage au
// premier accès par LocalStorageIngredientRepository : tout ingrédient absent
// (comparaison par nom, insensible à la casse) est ajouté. On peut donc
// enrichir cette liste, les nouveautés se propageront au prochain chargement.
const seed: Array<[name: string, unit: Unit]> = [
  // Légumes
  ['Tomate', 'piece'],
  ['Tomates cerises', 'g'],
  ['Oignon', 'piece'],
  ['Oignon rouge', 'piece'],
  ['Ail', 'piece'],
  ['Échalote', 'piece'],
  ['Carotte', 'piece'],
  ['Pomme de terre', 'g'],
  ['Patate douce', 'piece'],
  ['Courgette', 'piece'],
  ['Aubergine', 'piece'],
  ['Poivron', 'piece'],
  ['Brocoli', 'piece'],
  ['Chou-fleur', 'piece'],
  ['Poireau', 'piece'],
  ['Concombre', 'piece'],
  ['Salade verte', 'piece'],
  ['Épinards', 'g'],
  ['Champignons de Paris', 'g'],
  ['Haricots verts', 'g'],
  ['Petits pois', 'g'],
  ['Avocat', 'piece'],
  ['Céleri', 'piece'],

  // Fruits
  ['Citron', 'piece'],
  ['Citron vert', 'piece'],
  ['Pomme', 'piece'],
  ['Poire', 'piece'],
  ['Banane', 'piece'],
  ['Orange', 'piece'],
  ['Fraises', 'g'],
  ['Framboises', 'g'],

  // Viandes & poissons
  ['Blanc de poulet', 'piece'],
  ['Cuisse de poulet', 'piece'],
  ['Poulet entier', 'piece'],
  ['Bœuf haché', 'g'],
  ['Steak haché', 'piece'],
  ['Escalope de dinde', 'piece'],
  ['Côte de porc', 'piece'],
  ['Filet mignon de porc', 'piece'],
  ['Lardons', 'g'],
  ['Jambon blanc', 'piece'],
  ['Chorizo', 'g'],
  ['Saucisse', 'piece'],
  ['Merguez', 'piece'],
  ['Pavé de saumon', 'piece'],
  ['Filet de cabillaud', 'piece'],
  ['Thon en boîte', 'g'],
  ['Crevettes', 'g'],

  // Féculents & légumineuses
  ['Riz', 'g'],
  ['Riz basmati', 'g'],
  ['Pâtes', 'g'],
  ['Spaghetti', 'g'],
  ['Semoule', 'g'],
  ['Quinoa', 'g'],
  ['Boulgour', 'g'],
  ['Lentilles vertes', 'g'],
  ['Lentilles corail', 'g'],
  ['Pois chiches', 'g'],
  ['Haricots rouges', 'g'],
  ['Pain', 'piece'],
  ['Tortillas', 'piece'],
  ['Pâte feuilletée', 'piece'],
  ['Pâte brisée', 'piece'],
  ['Pâte à pizza', 'piece'],

  // Produits laitiers & œufs
  ['Œuf', 'piece'],
  ['Lait', 'ml'],
  ['Beurre', 'g'],
  ['Crème fraîche', 'g'],
  ['Crème liquide', 'ml'],
  ['Yaourt nature', 'piece'],
  ['Fromage râpé', 'g'],
  ['Parmesan', 'g'],
  ['Mozzarella', 'piece'],
  ['Feta', 'g'],
  ['Fromage de chèvre', 'g'],
  ['Comté', 'g'],
  ['Lait de coco', 'ml'],

  // Épicerie & condiments
  ['Farine', 'g'],
  ['Sucre', 'g'],
  ['Sucre vanillé', 'piece'],
  ['Levure chimique', 'piece'],
  ['Chocolat noir', 'g'],
  ['Miel', 'tbsp'],
  ["Huile d'olive", 'tbsp'],
  ['Huile de tournesol', 'tbsp'],
  ['Vinaigre balsamique', 'tbsp'],
  ['Moutarde', 'tsp'],
  ['Mayonnaise', 'tbsp'],
  ['Ketchup', 'tbsp'],
  ['Sauce soja', 'tbsp'],
  ['Coulis de tomates', 'ml'],
  ['Concentré de tomates', 'tbsp'],
  ['Tomates pelées', 'g'],
  ['Bouillon de volaille', 'piece'],
  ['Bouillon de légumes', 'piece'],
  ['Olives', 'g'],
  ['Câpres', 'tbsp'],
  ['Cornichons', 'piece'],
  ['Amandes', 'g'],
  ['Noix', 'g'],
  ['Pignons de pin', 'g'],

  // Épices & herbes
  ['Sel', 'tsp'],
  ['Poivre', 'tsp'],
  ['Paprika', 'tsp'],
  ['Cumin', 'tsp'],
  ['Curry', 'tsp'],
  ['Curcuma', 'tsp'],
  ['Cannelle', 'tsp'],
  ['Herbes de Provence', 'tsp'],
  ['Thym', 'tsp'],
  ['Laurier', 'piece'],
  ['Origan', 'tsp'],
  ['Basilic', 'g'],
  ['Persil', 'g'],
  ['Coriandre', 'g'],
  ['Ciboulette', 'g'],
  ['Menthe', 'g'],
  ['Gingembre', 'g'],
]

// Id stable dérivé du nom ("Crème fraîche" → "seed-creme-fraiche") :
// pas de collision avec les ids crypto.randomUUID() des ingrédients créés
// depuis le formulaire.
function slug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]+/g, '-')
}

export const SEED_INGREDIENTS: Ingredient[] = seed.map(
  ([name, defaultUnit]) => ({ id: `seed-${slug(name)}`, name, defaultUnit }),
)
