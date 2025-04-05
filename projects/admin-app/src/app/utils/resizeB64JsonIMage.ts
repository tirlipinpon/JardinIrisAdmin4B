// Fonction pour redimensionner l'image
export  function compressImage(base64Str: any, maxWidth = 800, maxHeight = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Si la chaîne ne contient pas de type MIME, on ajoute un préfixe par défaut
      if (!base64Str.startsWith('data:image/')) {
        // Supposons que c'est une image JPEG par défaut (tu peux adapter cela)
        base64Str = 'data:image/jpeg;base64,' + base64Str;
      }

      const matches = base64Str.match(/data:(.*?);base64,/);
      if (!matches || matches.length < 2) {
        reject("Erreur : Impossible de trouver le type MIME dans la chaîne base64.");
        return;
      }

      const mimeType = matches[1]; // Extraire le type MIME

      // Convertir la chaîne base64 en Blob
      const imageBlob = base64ToBlob(base64Str, mimeType);

      // Créer un objet URL pour l'image Blob
      const imageUrl = URL.createObjectURL(imageBlob);

      let img = new Image();
      img.src = imageUrl;

      img.onload = () => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        if (ctx) {
          // Calculer le ratio de redimensionnement
          let ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
          let width = img.width * ratio;
          let height = img.height * ratio;

          // Redimensionner l'image
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Obtenir l'image redimensionnée au format base64
          resolve(canvas.toDataURL('image/jpeg', 0.9)); // Compression à 70%
        } else {
          reject("Erreur : Impossible de récupérer le contexte 2D du canvas.");
        }
      };

      img.onerror = (error) => {
        reject("Erreur lors du chargement de l'image : " + error);
      };
    } catch (error) {
      reject("Erreur lors de la conversion : " + error);
    }
  });
}



export function base64ToBlob(base64: any, mimeType: any) {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}

