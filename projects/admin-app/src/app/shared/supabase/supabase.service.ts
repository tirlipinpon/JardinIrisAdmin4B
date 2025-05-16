import { Injectable } from '@angular/core';
import {createClient, PostgrestError, SupabaseClient} from "@supabase/supabase-js";
import {environment} from "../../../../../../environment";
import {Post} from "../../types/post";
import {Observable, of} from "rxjs";

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

  async setNewUrlImagesChapitres(url: string, chapitreId: number, postId: number, chapitreKeyWord: string, chapitreExplanationWord: string, chapitreExplanationImage: string): Promise<any> {
    try {
      const {data, error} = await this.supabase
        .from('urlImagesChapitres')
        .insert([
          {
            fk_post: postId,
            url_Image: url,
            chapitre_id: chapitreId,
            chapitre_key_word: chapitreKeyWord,
            explanation_word: chapitreExplanationWord,
            explanation_image: chapitreExplanationImage
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

  async getAllComments() {
    try {
      let query = this.supabase
        .from('comments')
        .select('*')
        .order('id', {ascending: true});

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

  async updatePostByPostForm(dataPost: Post) {
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
        return data;
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

  async updatePostNewUrl(postId: number, url: string) {
    try {
      const {data, error} = await this.supabase
        .from('post')
        .update({new_href: url})
        .eq('id', postId)
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

  async testAccess() {
    try {
      const { data, error } = await this.supabase.storage
        .from('jardin-iris-images-post')
        .list('');

      if (error) {
        console.error('Erreur accès bucket :', error);
      } else {
        console.log('Accès au bucket réussi :', data);
      }
    } catch (err) {
      console.error('Erreur critique :', err);
    }
  }


  async testUpload() {
    console.log('testUpload aleatoire :', Math.floor(Math.random() * 1000) + 1);
    const testBlob = new Blob(['Hello worldscscscscscscs'], { type: 'text/plain' });

    try {
      const { data, error } = await this.supabase.storage
        .from('jardin-iris-images-post')
        .upload('test-upload-2-.png', testBlob, {
          upsert: true,
        });

      if (error) {
        console.error('Erreur lors de l\'upload :', error);
      } else {
        console.log('Fichier uploadé avec succès :', data);
      }
    } catch (err) {
      console.error('Erreur critique :', err);
    }
  }


  async testDeleteAndUpload() {
    const fileName = 'test-upload-2-3.png';

    try {
      // Supprimer le fichier s'il existe
      const { error: deleteError } = await this.supabase.storage
        .from('jardin-iris-images-post')
        .remove([fileName]);

      if (deleteError) {
        console.error('Erreur lors de la suppression :', deleteError);
      } else {
        console.log('Fichier supprimé avec succès ou inexistant.');
      }

      // Créer un fichier de test
      const testBlob = new Blob(['Nouveau contenu'], { type: 'text/plain' });

      // Upload le fichier
      const { data, error } = await this.supabase.storage
        .from('jardin-iris-images-post')
        .upload(fileName, testBlob, { upsert: true });

      if (error) {
        console.error('Erreur lors de l\'upload :', error);
      } else {
        console.log('Fichier uploadé avec succès :', data);
      }
    } catch (err) {
      console.error('Erreur critique :', err);
    }
  }





}
