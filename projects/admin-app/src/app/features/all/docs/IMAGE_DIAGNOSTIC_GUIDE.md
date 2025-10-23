# 🔍 Guide de Diagnostic des Images

Ce guide vous aide à diagnostiquer et résoudre les problèmes d'injection d'images dans les articles de blog.

## 📊 Comprendre les Logs

### Logs du PostImageInjectorService

```
[PostImageInjectorService] 🚀 Début de l'injection d'images pour le post 123
[PostImageInjectorService] 📊 Données d'entrée: { postId: 123, ... }
[PostImageInjectorService] 🔍 Traitement du paragraphe 1
[PostImageInjectorService] ✅ Image injectée avec succès dans le chapitre 1
[PostImageInjectorService] 📈 Résumé de l'injection pour le post 123
```

### Logs du PostValidationService

```
[PostValidationService] 🖼️ Début de l'injection d'images pour le post 123
[PostValidationService] 📈 Résultat de l'injection: { ... }
[PostValidationService] ✅ Injection réussie pour le post 123 (100%)
```

### Logs du SearchInfrastructure

```
[SearchInfrastructure] 🚀 Début du traitement des images pour le post 123
[SearchInfrastructure] 📸 Traitement de l'image principale pour le post 123
[SearchInfrastructure] ✅ Image principale uploadée avec succès
[SearchInfrastructure] 📚 Traitement de 3 image(s) de chapitres
[SearchInfrastructure] ✅ Images de chapitres traitées avec succès
```

## 🚨 Problèmes Courants et Solutions

### 1. Images non injectées (0% d'injection)

**Symptômes:**

- `imagesInjected: 0`
- `injectionRate: 0%`
- `missingImages: X`

**Causes possibles:**

- Aucune image dans `images_chapitres`
- URLs d'images invalides
- Structure HTML de l'article incorrecte
- Problème de regex pour trouver les paragraphes

**Solutions:**

1. Vérifier que `images_chapitres` contient des images
2. Valider les URLs avec `validateImageUrl()`
3. Vérifier la structure HTML (spans avec id="paragraphe-X")
4. Utiliser le mode fallback automatique

### 2. Injection partielle (< 100%)

**Symptômes:**

- `imagesInjected: 2` sur 5 images
- `injectionRate: 40%`
- `missingImages: 3`

**Causes possibles:**

- Certaines images ont des URLs invalides
- Certains chapitres n'ont pas de structure `</ul>`
- Images déjà présentes (détection de doublons)

**Solutions:**

1. Vérifier chaque image individuellement
2. Corriger les URLs invalides
3. Vérifier la structure HTML des chapitres manquants
4. Nettoyer les images en double

### 3. Images non uploadées sur Supabase

**Symptômes:**

- `isSupabaseUrl: false`
- URLs externes (Pexels, etc.)
- `changed: true` sur les images

**Solutions:**

1. Le système uploadera automatiquement les images externes
2. Vérifier que `processPostImages()` est appelé
3. Attendre la fin du traitement asynchrone

### 4. Format d'image non optimisé

**Symptômes:**

- `isWebpFormat: false`
- URLs se terminant par `.jpg`, `.png`
- Avertissements dans les logs

**Solutions:**

1. Le système convertit automatiquement en WebP
2. Vérifier que l'upload s'est bien passé
3. Forcer la reconversion si nécessaire

### 5. Texte alternatif manquant

**Symptômes:**

- `hasValidAlt: false`
- `altTextLength: 0`
- Avertissements d'accessibilité

**Solutions:**

1. Le système génère automatiquement l'alt text
2. Vérifier que `chapitre_key_word` est rempli
3. Fallback sur le nom de fichier

## 🔧 Utilisation du Service de Diagnostic

### Diagnostic d'un post spécifique

```typescript
const diagnostic = this.imageDiagnostic.diagnosePostImages(postId, articleContent, imagesChapitres);

// Afficher le diagnostic dans la console
this.imageDiagnostic.logDiagnostic(diagnostic);
```

### Vérification de la santé du système

```typescript
const healthReport = this.imageDiagnostic.checkSystemHealth(posts);
console.log("Statut du système:", healthReport.systemStatus);
```

### Utilisation du composant de diagnostic

```html
<app-image-diagnostic [postId]="post.id" [articleContent]="post.article" [imagesChapitres]="post.images_chapitres"> </app-image-diagnostic>
```

## 📈 Métriques de Performance

### Taux d'injection acceptable

- **100%** : Excellent ✅
- **80-99%** : Bon ⚠️
- **< 80%** : Problématique ❌

### Taux de validation acceptable

- **100%** : Excellent ✅
- **90-99%** : Bon ⚠️
- **< 90%** : Problématique ❌

### Formats d'image recommandés

- **WebP** : Optimal ✅
- **JPEG/PNG** : Acceptable ⚠️
- **Autres** : Non recommandé ❌

## 🛠️ Outils de Debug

### 1. Validation manuelle d'une image

```typescript
const result = validateImage("https://example.com/image.jpg", "Description de l'image", 1);

console.log("Image valide:", result.isValid);
console.log("Problèmes:", result.issues);
```

### 2. Vérification de l'injection

```typescript
const count = countInjectedImages(articleContent);
console.log("Images injectées:", count);
```

### 3. Vérification d'une image spécifique

```typescript
const isInjected = isImageAlreadyInjected(articleContent, chapitreId);
console.log("Image injectée:", isInjected);
```

## 🚀 Solutions Automatiques

Le système inclut plusieurs mécanismes de récupération automatique :

1. **Mode Fallback** : Injection manuelle si l'injection automatique échoue
2. **Retry Logic** : 3 tentatives avec délai exponentiel pour les uploads
3. **Validation Continue** : Vérification à chaque étape
4. **Logs Détaillés** : Traçabilité complète du processus

## 📞 Support

En cas de problème persistant :

1. Consulter les logs détaillés dans la console
2. Utiliser le composant de diagnostic
3. Vérifier la configuration Supabase
4. Tester avec des images de test simples

---

_Ce guide est mis à jour automatiquement avec les nouvelles fonctionnalités du système._
