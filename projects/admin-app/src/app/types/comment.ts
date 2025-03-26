export interface Comment {
  id: number; // int8
  created_at: Date; // date
  avatar: string; // text
  name: string; // text
  comment: string; // text
  stars: number; // smallint (int2)
  valide: boolean; // bool
  fk_post: number; // int8
  email: string; // text
  newsletter: boolean; // bool
  like: number; // int4
  fk_reply?: number; // int8, foreign key from another comment (optional)
}
