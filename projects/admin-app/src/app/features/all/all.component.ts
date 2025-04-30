import {Component, computed, inject, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {PostStore} from "../edit/store";
import {Post} from "../../types/post";
import {FormBuilder} from "@angular/forms";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all',
  imports: [RouterLink, CommonModule],
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})
export class AllComponent implements OnInit {
  private readonly store = inject(PostStore);
  post: Post[] | null = null;
  private readonly formBuilder = inject(FormBuilder);
  isLoading = this.store.loading;
  constructor() { }

  postFromSignal = computed(() => {
    return this.store.post()
  })

  ngOnInit(): void {
      this.store.getOneOrManyPostForm(undefined);
  }

  getPostStatusClass(post: any): string {
    if (post.deleted) return 'post-deleted';
    if (post.valid === false) return 'post-invalid';
    return 'post-normal';
  }


  deletePost(post: Post) {
  }

  editPostById(id: any) {

  }

  validPostById(id: any) {

  }

  getValidCommentsCount(post: any) {
    return "";
  }

  deleteCommentById(comment: any) {

  }

  valideCommentById(comment: any) {

  }
}
