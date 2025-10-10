/**
 * Traite une image : redimensionne, crop depuis le centre, convertit en WebP et compresse
 * @param blob - Blob de l'image source
 * @param targetWidth - Largeur cible (700px)
 * @param targetHeight - Hauteur cible (250px)
 * @param maxSizeKb - Taille maximale en Ko (60Ko)
 * @returns Promise<Blob> - Image traitée en WebP
 */
export async function processImageChapitre(
  blob: Blob,
  targetWidth: number = 700,
  targetHeight: number = 250,
  maxSizeKb: number = 60
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      try {
        // Libérer l'URL temporaire
        URL.revokeObjectURL(url);

        // Créer un canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        // Définir les dimensions du canvas
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Calculer les dimensions pour le crop centré (cover)
        const imgRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;

        let sourceWidth, sourceHeight, sourceX, sourceY;

        if (imgRatio > targetRatio) {
          // Image plus large que la cible : crop sur la largeur
          sourceHeight = img.height;
          sourceWidth = img.height * targetRatio;
          sourceX = (img.width - sourceWidth) / 2;
          sourceY = 0;
        } else {
          // Image plus haute que la cible : crop sur la hauteur
          sourceWidth = img.width;
          sourceHeight = img.width / targetRatio;
          sourceX = 0;
          sourceY = (img.height - sourceHeight) / 2;
        }

        // Dessiner l'image avec crop centré
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetWidth, targetHeight
        );

        // Fonction pour convertir en WebP avec une qualité donnée
        const convertToWebP = (quality: number): Promise<Blob | null> => {
          return new Promise((resolveConvert) => {
            canvas.toBlob(
              (webpBlob) => resolveConvert(webpBlob),
              'image/webp',
              quality
            );
          });
        };

        // Compression adaptative pour atteindre la taille cible
        const compressImage = async () => {
          let quality = 0.9;
          let webpBlob: Blob | null = null;
          const maxSizeBytes = maxSizeKb * 1024;

          // Essayer avec différentes qualités jusqu'à atteindre la taille cible
          while (quality > 0.1) {
            webpBlob = await convertToWebP(quality);

            if (!webpBlob) {
              reject(new Error('Échec de la conversion en WebP'));
              return;
            }

            console.log(`Qualité ${quality.toFixed(2)}: ${(webpBlob.size / 1024).toFixed(2)}Ko`);

            if (webpBlob.size <= maxSizeBytes) {
              console.log(`✓ Image compressée avec succès: ${(webpBlob.size / 1024).toFixed(2)}Ko`);
              resolve(webpBlob);
              return;
            }

            // Réduire la qualité progressivement
            quality -= 0.1;
          }

          // Si même avec qualité minimale on dépasse, on retourne quand même
          console.warn(`⚠ Image finale: ${(webpBlob!.size / 1024).toFixed(2)}Ko (dépasse ${maxSizeKb}Ko)`);
          resolve(webpBlob!);
        };

        compressImage();

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Erreur de chargement de l\'image'));
    };

    img.src = url;
  });
}

