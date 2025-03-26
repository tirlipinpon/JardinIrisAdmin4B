import { Injectable } from '@angular/core';
import {createClient, PostgrestError, SupabaseClient} from "@supabase/supabase-js";
import {environment} from "../../../../../../../../environment";

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }

  async setNewPostForm(value: any): Promise<any> {
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

  async getOneOrManyPostForm(idPost?: number, orderBySelected?: string) {
    try {
      let query = this.supabase
        .from('post')
        .select('*')

      if (idPost && idPost>0) {
        query = query.eq('id', idPost);
      }

      if (orderBySelected) {
        if(orderBySelected==='valid') {
          query = query.order(orderBySelected, { ascending: true });
        } else if(orderBySelected==='original') {
          query = query
            .eq('valid', true)
            .eq('deleted', false)
            .order('created_at', { ascending: false });
        } else {
          query = query.order(orderBySelected, { ascending: false });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

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
        .order('id', { ascending: true });

      const { data, error } = await query;

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
      const { data, error } = await this.supabase
        .from('post')
        .update({ deleted: 'true' })
        .eq('id', idPost)

      if (error) {
        throw error;
      }
      console.log(data);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateValidPostByIdForm(idPost: number) {
    try {
      const { data, error } = await this.supabase
        .from('post')
        .update({ valid: 'true' })
        .eq('id', idPost)

      if (error) {
        throw error;
      }
      console.log(data);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updatePostByPostForm(dataPost: any) {
    try {
      const { data, error } = await this.supabase
        .from('post')
        .update(dataPost)
        .eq('id', dataPost.id);

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
      const { data, error } = await this.supabase
        .from('comments')
        .update({ valide: 'false' })
        .eq('id', id)

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async valideCommentById(id: number) {
    try {
      const { data, error } = await this.supabase
        .from('comments')
        .update({ valide: 'true' })
        .eq('id', id)

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

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async setNewUrlImagesChapitres(url: string, chapitreId: number, postId: number, chapitreKeyWord: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('urlImagesChapitres')
        .insert([
          {
            fk_post: postId,
            url_Image: url,
            chapitre_id: chapitreId,
            chapitre_key_word: chapitreKeyWord,
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
