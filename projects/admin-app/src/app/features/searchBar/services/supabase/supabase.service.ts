import { Injectable } from '@angular/core';
import {createClient, PostgrestError, SupabaseClient} from "@supabase/supabase-js";
import {environment} from "../../../../../../../../environment";
import {Post} from "../../../../types/post";
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
      const { data, error } = await this.supabase
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

  async getFirstIdeaPostByMonth(month: number, year: number): Promise<{ id: number | null, "description": string | null } | PostgrestError>  {
    const { data, error } = await this.supabase
      .from('ideaPost')
      .select('id, description')
      .gte('created_at', `${year}-${month.toString().padStart(2, '0')}-01`) // Ajout de padStart pour le format
      .lt('created_at', `${year}-${(month + 1).toString().padStart(2, '0')}-01`) // Gestion du mois suivant
      .eq('deleted', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.log(' Erreur lors de la récupération des posts: ' + (error))
      return error
    } else {
      console.log("getFirstIdeaPostByMonth = " + JSON.stringify(data, null, 2))
      return data.length > 0 ? data[0] : { id: null, description: null };
    }
  }

  async updateIdeaPostById(id: number, fk_idPost: number) {
    try {
      const { data, error } = await this.supabase
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
      const { data, error } = await this.supabase
        .from('post')
        .update({ image_url: json64 })
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
        .select('id, titre')
        .eq('valid', true)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
        .limit(20)


      const { data, error } = await query;

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
      const { data, error } = await this.supabase
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

}
