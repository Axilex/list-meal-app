// Firestore rejette les champs `undefined` (fréquents dans les modèles :
// steps?, note?, durationMin?…). Les modèles du domaine étant
// JSON-sérialisables, un aller-retour JSON suffit à les retirer.
export function toFirestoreData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
