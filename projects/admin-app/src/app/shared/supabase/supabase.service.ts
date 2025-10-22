import { inject, Injectable } from '@angular/core';
import { createClient, PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../../../../../../environment";
import { Post } from "../../types/post";
import { Observable, of } from "rxjs";
import { processImageChapitre } from "../../utils/processImageChapitre";
import { OpenaiApiService } from "../../features/searchBar/services/openai-api/openai-api.service";
import { textToSlug } from "../../utils/textToSlug";

export interface AuthResponse {
  data: {
    user: any | null;
    session: any | null;
  };
  error: any | null;
}


@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient
  private openaiService = inject(OpenaiApiService);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }

  signInMock(email: string, password: string): Observable<AuthResponse> {
    // Copie d'une réponse réelle que vous avez capturée précédemment
    const mockResponse: AuthResponse = {
      data: {
        user: {
          id: 'user-123',
          email: email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2023-10-25T12:00:00.000Z',
          // ... autres propriétés requises
        },
        session: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123',
          expires_at: Date.now() + 3600000,
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            // Dupliquer les mêmes données que ci-dessus
            id: 'user-123',
            email: email,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2023-10-25T12:00:00.000Z',
            // ... autres propriétés requises
          }
        }
      },
      error: null
    };

    return of(mockResponse);
  }

  async setNewPostForm(value: Post): Promise<Post[]> {
    try {
      const {data, error} = await this.supabase
        .from('post')
        .insert([value])
        .select();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async setNewFaq(value: any): Promise<any> {
    try {
      const {data, error} = await this.supabase
        .from('faq')
        .insert([value]);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getFirstIdeaPostByMonth(month: number, year: number): Promise<{
    id: number | null,
    "description": string | null
  } | PostgrestError> {
    const {data, error} = await this.supabase
      .from('ideaPost')
      .select('id, description')
      .gte('created_at', `${year}-${month.toString().padStart(2, '0')}-01`) // Ajout de padStart pour le format
      .lt('created_at', `${year}-${(month + 1).toString().padStart(2, '0')}-01`) // Gestion du mois suivant
      .eq('deleted', false)
      .order('created_at', {ascending: false})
      .limit(1);

    if (error) {
      console.log(' Erreur lors de la récupération des posts: ' + (error))
      return error
    } else {
      console.log("getFirstIdeaPostByMonth = " + JSON.stringify(data, null, 2))
      return data.length > 0 ? data[0] : {id: null, description: null};
    }
  }

  async updateIdeaPostById(id: number, fk_idPost: number) {
    try {
      const {error} = await this.supabase
        .from('ideaPost')
        .update({
          deleted: true,
          fk_id_post: fk_idPost
        })
        .eq('id', id)
      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async updateImageUrlPostByIdForm(idPost: number, json64: string) {
    try {
      const {data, error} = await this.supabase
        .from('post')
        .update({image_url: json64})
        .eq('id', idPost)
        .select()

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getPostTitreAndId() {
    try {
      let query = this.supabase
        .from('post')
        .select('id, titre, new_href')
        .eq('valid', true)
        .eq('deleted', false)
        .order('created_at', {ascending: false})
        .limit(20)


      const {data, error} = await query;

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async setNewUrlImagesChapitres(url: string, chapitreId: number, postId: number, chapitreKeyWord: string, chapitreExplanationWord: string): Promise<any> {
    try {
      const {data, error} = await this.supabase
        .from('urlImagesChapitres')
        .insert([
          {
            fk_post: postId,
            url_Image: url,
            chapitre_id: chapitreId,
            chapitre_key_word: chapitreKeyWord,
            explanation_word: chapitreExplanationWord
          }
        ]);

      if (error) {
        console.error('Erreur lors de l\'insertion des données:', error);
      } else {
        console.log('Données insérées avec succès:', JSON.stringify(data));
      }

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getOneOrManyPostForm(idPost?: number, orderBySelected?: string) {
    try {
      let query = this.supabase
        .from('post')
        .select('*')

      if (idPost && idPost > 0) {
        query = query.eq('id', idPost);
      }

      if (orderBySelected) {
        if (orderBySelected === 'valid') {
          query = query.order(orderBySelected, {ascending: true});
        } else if (orderBySelected === 'original') {
          query = query
            .eq('valid', true)
            .eq('deleted', false)
            .order('created_at', {ascending: false});
        } else {
          query = query.order(orderBySelected, {ascending: false});
        }
      } else {
        query = query.order('created_at', {ascending: false});
      }

      const {data, error} = await query;

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async deletePostByIdForm(idPost: number) {
    try {
      const {data, error} = await this.supabase
        .from('post')
        .update({deleted: 'true'})
        .eq('id', idPost)
        .select();

      if (error) {
        throw error;
      }
      console.log(data);
      return data[0];
    } catch (error) {
      throw error;
    }
  }

  async updateValidPostByIdForm(idPost: number) {
    try {
      const {data, error} = await this.supabase
        .from('post')
        .update({valid: 'true'})
        .eq('id', idPost)
        .select();

      if (error) {
        throw error;
      }
      console.log(data);
      return data[0];
    } catch (error) {
      throw error;
    }
  }

  async updatePostByPostForm(dataPost: Post | any) {
    try {
      const {data, error} = await this.supabase
        .from('post')
        .update(dataPost)
        .eq('id', dataPost.id)
        .select();

      if (error) {
        throw error;
      }
      console.log(data);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteCommentById(id: number) {
    try {
      const {data, error} = await this.supabase
        .from('comments')
        .update({valide: 'false'})
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }
      return data[0];
    } catch (error) {
      throw error;
    }
  }

  async valideCommentById(id: number) {
    try {
      const {data, error} = await this.supabase
        .from('comments')
        .update({valide: 'true'})
        .eq('id', id)
        .select()

      if (error) {
        throw error;
      }
      return data[0];
    } catch (error) {
      throw error;
    }
  }

  async getPostWithCommentsAndImages(id?: number | null, orderBySelected?: string | null) {
    try {
      // Si 'id' est undefined, on le remplace par NULL pour PostgreSQL
      const idPost = id ?? null;  // Si 'id' est undefined, idPost sera null

      // Si 'orderBySelected' est undefined, on le remplace par NULL pour PostgreSQL
      const orderBy = orderBySelected ?? null;  // Si 'orderBySelected' est undefined, orderBy sera null

      // Appel à la fonction RPC de Supabase avec les paramètres
      const { data, error } = await this.supabase.rpc('get_posts_with_comments_and_image', {
        idpost: idPost,       // Passer 'idPost' à la fonction
        orderbyselected: orderBy   // Passer 'orderBy' à la fonction
      });

      if (error) {
        console.error('Erreur lors de l’appel de la fonction :', error);
        return error;
      } else {
        return data?.slice(0, 3);
      }
    } catch (error) {
      throw error;
    }
  }

  async editPostVideo(idPost: number, idYoutube: string) {
    try {
      const {data, error} = await this.supabase
        .from('post')
        .update({video: 'https://www.youtube.com/watch?v='+idYoutube})
        .eq('id', idPost)
        .select();

      if (error) {
        throw error;
      }
      console.log(data);
      return data[0];
    } catch (error) {
      throw error;
    }
  }

  async editImagesChapitreArticle(id: number, url: string, key: string) {
    try {
      const {data, error} = await this.supabase
        .from('urlImagesChapitres')
        .update({url_Image: url, chapitre_key_word: key, explanation_image: "", explanation_word: ""})
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }
      console.log(data);
      return data[0];
    } catch (error) {
      throw error;
    }
  }

  async uploadImageFromUrlToBucket(postId: number, originalImageUrl: string): Promise<string | null> {
    try {
      // Construire l'URL de ta fonction Edge Supabase avec le paramètre imageUrl
      const proxyFunctionUrl = `https://zmgfaiprgbawcernymqa.supabase.co/functions/v1/fetch-image?imageUrl=${encodeURIComponent(originalImageUrl)}`;

      // Télécharger l'image via la fonction Edge (proxy qui gère CORS)
      const response = await fetch(proxyFunctionUrl, {
        headers: {
          Authorization: `Bearer ${environment.supabaseAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement proxy de l'image : ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'Type:', blob.type);

      // Uploader le fichier dans Supabase Storage
      const { data, error } = await this.supabase.storage.from(environment.supabaseBucket).upload(`${postId}.png`, blob, {
        contentType: blob.type,
        upsert: true,
        headers: {
          Authorization: `Bearer ${environment.supabaseAnonKey}`
        }
      });

      if (error) {
        throw new Error(`Erreur d'upload : ${error.message}`);
      }

      // Récupérer l'URL publique
      const { data: publicUrlData } = this.supabase.storage.from(environment.supabaseBucket).getPublicUrl(`${postId}.png`);

      return publicUrlData?.publicUrl || '';
    } catch (error) {
      console.error('Erreur uploadImageFromUrl:', error);
      return null;
    }
  }

  async uploadBase64ViaEdge(postId: number, b64_json: string): Promise<string | null> {
    try {
      // 1️⃣ Convertir le base64 en Blob
      const byteCharacters = atob(b64_json);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // 2️⃣ Convertir le Blob en URL via URL.createObjectURL pour passer à la fonction Edge
      const blobUrl = URL.createObjectURL(blob);

      // 3️⃣ Appeler la fonction Edge pour upload
      const proxyFunctionUrl = `https://zmgfaiprgbawcernymqa.supabase.co/functions/v1/fetch-image?imageUrl=${encodeURIComponent(blobUrl)}`;
      const response = await fetch(proxyFunctionUrl, {
        headers: {
          Authorization: `Bearer ${environment.supabaseAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement proxy de l'image : ${response.statusText}`);
      }

      const uploadedBlob = await response.blob();

      // 4️⃣ Uploader le fichier final dans Supabase Storage
      const { data, error } = await this.supabase.storage.from(environment.supabaseBucket)
        .upload(`${postId}.png`, uploadedBlob, { contentType: uploadedBlob.type, upsert: true });

      if (error) throw error;

      // 5️⃣ Récupérer l'URL publique
      const { data: publicUrlData } = this.supabase.storage.from(environment.supabaseBucket)
        .getPublicUrl(`${postId}.png`);

      return publicUrlData?.publicUrl || '';
    } catch (error) {
      console.error('Erreur uploadBase64ViaEdge:', error);
      return null;
    }
  }

  async uploadBase64ToSupabase(postId: number, b64_json: string): Promise<string | null> {
    try {
      // 1️⃣ Convertir le base64 en Uint8Array
      const byteCharacters = atob(b64_json);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);

      // 2️⃣ Upload direct dans Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(environment.supabaseBucket)
        .upload(`${postId}.png`, byteArray, {
          contentType: "image/png",
          upsert: true,
        });

      if (error) throw error;

      // 3️⃣ Récupérer l'URL publique
      const { data: publicUrlData } = this.supabase.storage
        .from(environment.supabaseBucket)
        .getPublicUrl(`${postId}.png`);

      return publicUrlData?.publicUrl || null;
    } catch (err) {
      console.error("Erreur uploadBase64ToSupabase:", err);
      return null;
    }
  }

  /**
   * Upload l'image principale d'un post avec analyse IA pour générer un nom de fichier SEO
   * @param postId - ID du post
   * @param imageUrl - URL de l'image à uploader
   * @returns L'URL publique de l'image uploadée ou null en cas d'erreur
   */
  async uploadMainImageWithAI(postId: number, imageUrl: string): Promise<string | null> {
    console.log(`[uploadMainImageWithAI] Début du traitement pour postId: ${postId}`);
    console.log(`[uploadMainImageWithAI] URL source: ${imageUrl}`);
    
    try {
      // 1️⃣ Télécharger l'image via proxy
      const proxyFunctionUrl = `https://zmgfaiprgbawcernymqa.supabase.co/functions/v1/fetch-image?imageUrl=${encodeURIComponent(imageUrl)}`;
      
      const response = await fetch(proxyFunctionUrl, {
        headers: {
          Authorization: `Bearer ${environment.supabaseAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement proxy de l'image : ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log(`[uploadMainImageWithAI] ✓ Image téléchargée - Taille: ${(blob.size / 1024).toFixed(2)} Ko, Type: ${blob.type}`);

      // 2️⃣ Analyser l'image avec l'IA pour générer un titre SEO
      let fileName: string;
      
      try {
        console.log(`[uploadMainImageWithAI] 🤖 Analyse de l'image par IA pour générer un titre SEO...`);
        const aiDescription = await this.openaiService.describeImage(imageUrl);
        
        if (aiDescription) {
          const slug = textToSlug(aiDescription);
          fileName = `${slug}.png`;
          console.log(`[uploadMainImageWithAI] ✓ Titre SEO généré par IA: "${aiDescription}"`);
          console.log(`[uploadMainImageWithAI] ✓ Nom de fichier SEO: ${fileName}`);
        } else {
          throw new Error('IA a retourné null');
        }
      } catch (aiError) {
        // Si l'IA échoue, utiliser le format avec postId (fallback)
        console.warn(`[uploadMainImageWithAI] ⚠ Échec de l'analyse IA, utilisation du format standard:`, aiError);
        fileName = `${postId}.png`;
      }

      // 3️⃣ Uploader le fichier dans Supabase Storage
      console.log(`[uploadMainImageWithAI] Début de l'upload vers Supabase Storage...`);
      const { data, error } = await this.supabase.storage
        .from(environment.supabaseBucket)
        .upload(fileName, blob, {
          contentType: blob.type,
          upsert: true,
          headers: {
            Authorization: `Bearer ${environment.supabaseAnonKey}`
          }
        });

      if (error) {
        throw new Error(`Erreur d'upload : ${error.message}`);
      }

      console.log(`[uploadMainImageWithAI] ✓ Upload réussi vers Supabase Storage`);

      // 4️⃣ Récupérer l'URL publique
      const { data: publicUrlData } = this.supabase.storage
        .from(environment.supabaseBucket)
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData?.publicUrl || '';
      console.log(`[uploadMainImageWithAI] ✓ Image principale uploadée avec succès: ${publicUrl}`);
      console.log(`[uploadMainImageWithAI] Résumé: download → IA SEO → upload → ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error(`[uploadMainImageWithAI] ❌ Erreur complète:`, {
        postId,
        imageUrl,
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
        errorStack: error instanceof Error ? error.stack : undefined
      });
      return null;
    }
  }

  /**
   * Upload une image de chapitre depuis une URL externe vers le bucket Supabase
   * @param postId - ID du post
   * @param chapitreId - ID du chapitre
   * @param externalImageUrl - URL externe de l'image
   * @returns Objet contenant l'URL publique et le titre SEO généré par l'IA, ou null en cas d'erreur
   */
  async uploadImageChapitreFromUrl(postId: number, chapitreId: number, externalImageUrl: string): Promise<{ url: string, seoTitle: string } | null> {
    console.log(`[uploadImageChapitreFromUrl] Début du traitement pour postId: ${postId}, chapitreId: ${chapitreId}`);
    console.log(`[uploadImageChapitreFromUrl] URL source: ${externalImageUrl}`);
    
    try {
      // 1️⃣ Télécharger l'image directement depuis le frontend (pas de problème CORS car déjà affiché)
      let blob: Blob;
      let downloadMethod = '';
      
      try {
        // Essai 1: Fetch direct depuis le frontend
        console.log(`[uploadImageChapitreFromUrl] Tentative de téléchargement direct...`);
        const directResponse = await fetch(externalImageUrl, {
          mode: 'cors',
          credentials: 'omit'
        });

        if (!directResponse.ok) {
          throw new Error(`Fetch direct échoué: ${directResponse.statusText} (${directResponse.status})`);
        }

        blob = await directResponse.blob();
        downloadMethod = 'direct';
        console.log(`[uploadImageChapitreFromUrl] ✓ Image téléchargée directement - Taille: ${(blob.size / 1024).toFixed(2)} Ko, Type: ${blob.type}`);
        
      } catch (directError) {
        // Essai 2: Si le fetch direct échoue, utiliser la fonction Edge comme fallback
        console.log(`[uploadImageChapitreFromUrl] ⚠ Fetch direct échoué, tentative via proxy Edge...`, directError);
        
        const proxyFunctionUrl = `https://zmgfaiprgbawcernymqa.supabase.co/functions/v1/fetch-image?imageUrl=${encodeURIComponent(externalImageUrl)}`;
        console.log(`[uploadImageChapitreFromUrl] URL proxy: ${proxyFunctionUrl}`);
        
        const proxyResponse = await fetch(proxyFunctionUrl, {
          headers: {
            Authorization: `Bearer ${environment.supabaseAnonKey}`
          }
        });

        if (!proxyResponse.ok) {
          throw new Error(`Erreur proxy Edge: ${proxyResponse.statusText} (${proxyResponse.status})`);
        }

        blob = await proxyResponse.blob();
        downloadMethod = 'proxy';
        console.log(`[uploadImageChapitreFromUrl] ✓ Image téléchargée via proxy - Taille: ${(blob.size / 1024).toFixed(2)} Ko, Type: ${blob.type}`);
      }

      // Vérifier que le blob n'est pas vide
      if (!blob || blob.size === 0) {
        throw new Error(`Blob vide ou invalide après téléchargement (méthode: ${downloadMethod})`);
      }

      // 2️⃣ Traiter l'image (resize 700x250, crop center, WebP, compression < 60Ko)
      console.log(`[uploadImageChapitreFromUrl] Début du traitement d'image (resize 700x250, WebP, <60Ko)...`);
      const processedBlob = await processImageChapitre(blob, 700, 250, 60);
      console.log(`[uploadImageChapitreFromUrl] ✓ Image traitée - Taille finale: ${(processedBlob.size / 1024).toFixed(2)} Ko`);

      // 3️⃣ Analyser l'image avec l'IA pour générer un titre SEO
      let seoTitle: string | null = null;
      let fileName: string;
      let filePath: string;
      
      try {
        console.log(`[uploadImageChapitreFromUrl] 🤖 Analyse de l'image par IA pour générer un titre SEO...`);
        // Utiliser l'URL externe pour l'analyse (plus fiable que le blob)
        const aiDescription = await this.openaiService.describeImage(externalImageUrl);
        
        if (aiDescription) {
          seoTitle = aiDescription;
          const slug = textToSlug(aiDescription);
          fileName = `${slug}.webp`;
          filePath = `${postId}/${fileName}`;
          console.log(`[uploadImageChapitreFromUrl] ✓ Titre SEO généré par IA: "${seoTitle}"`);
          console.log(`[uploadImageChapitreFromUrl] ✓ Nom de fichier SEO: ${fileName}`);
        } else {
          throw new Error('IA a retourné null');
        }
      } catch (aiError) {
        // Si l'IA échoue, utiliser le format avec timestamp (fallback)
        console.warn(`[uploadImageChapitreFromUrl] ⚠ Échec de l'analyse IA, utilisation du format timestamp:`, aiError);
        const timestamp = Date.now();
        fileName = `${postId}_chapitre_${chapitreId}_U_${timestamp}.webp`;
        filePath = `${postId}/${fileName}`;
        seoTitle = `chapitre-${chapitreId}`; // Titre par défaut
      }

      console.log(`[uploadImageChapitreFromUrl] Nom du fichier: ${fileName}, Chemin: ${filePath}`);

      // 4️⃣ Uploader le fichier traité dans Supabase Storage dans le bucket jardin-iris-images-post
      console.log(`[uploadImageChapitreFromUrl] Début de l'upload vers Supabase Storage...`);
      const { data, error } = await this.supabase.storage
        .from('jardin-iris-images-post')
        .upload(filePath, processedBlob, {
          contentType: 'image/webp',
          upsert: true,
          headers: {
            Authorization: `Bearer ${environment.supabaseAnonKey}`
          }
        });

      if (error) {
        throw new Error(`Erreur d'upload Supabase Storage: ${error.message}`);
      }

      console.log(`[uploadImageChapitreFromUrl] ✓ Upload réussi vers Supabase Storage`);

      // 5️⃣ Récupérer l'URL publique
      const { data: publicUrlData } = this.supabase.storage
        .from('jardin-iris-images-post')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl || '';
      console.log(`[uploadImageChapitreFromUrl] ✓ Image de chapitre uploadée avec succès: ${publicUrl}`);
      console.log(`[uploadImageChapitreFromUrl] Résumé: ${downloadMethod} → traitement → IA SEO → upload → ${publicUrl}`);
      
      return { url: publicUrl, seoTitle: seoTitle || `chapitre-${chapitreId}` };
    } catch (error) {
      console.error(`[uploadImageChapitreFromUrl] ❌ Erreur complète:`, {
        postId,
        chapitreId,
        externalImageUrl,
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
        errorStack: error instanceof Error ? error.stack : undefined
      });
      return null;
    }
  }

  /**
   * Met à jour l'URL d'une image de chapitre dans la base de données
   * @param imageId - ID de l'image dans la table urlImagesChapitres
   * @param newUrl - Nouvelle URL de l'image
   * @param seoTitle - Titre SEO optionnel généré par l'IA à sauvegarder dans chapitre_key_word
   * @returns Les données mises à jour ou null en cas d'erreur
   */
  async updateImageChapitreUrl(imageId: number, newUrl: string, seoTitle?: string): Promise<any> {
    try {
      const updateData: any = { url_Image: newUrl };
      
      // Si un titre SEO est fourni, l'ajouter à la mise à jour
      if (seoTitle) {
        updateData.chapitre_key_word = seoTitle;
        console.log(`[updateImageChapitreUrl] Mise à jour avec titre SEO: "${seoTitle}"`);
      }
      
      const { data, error } = await this.supabase
        .from('urlImagesChapitres')
        .update(updateData)
        .eq('id', imageId)
        .select();

      if (error) {
        throw error;
      }
      
      console.log('[updateImageChapitreUrl] ✓ URL et titre SEO mis à jour avec succès:', data);
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('[updateImageChapitreUrl] ❌ Erreur:', error);
      throw error;
    }
  }

}
