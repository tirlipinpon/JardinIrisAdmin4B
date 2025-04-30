import {Component, computed, inject, input, OnInit} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from "@angular/router";
import {PostStore} from "./store";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {Post} from "../../types/post";
import {Editor, NgxEditorModule, Toolbar} from "ngx-editor";
import {NgForOf, NgIf} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {CathegoriesBlog} from "../../types/cathegoriesBlog";
import {MatInputModule} from "@angular/material/input";


@Component({
  selector: 'app-edit',
  imports: [RouterOutlet, ReactiveFormsModule, NgxEditorModule, NgIf, NgForOf, RouterLink, MatFormFieldModule
    , MatSelect, MatInputModule, MatOption],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent implements OnInit {

    id = input<number>();
    cathegoriesBlog = CathegoriesBlog;
    categoryList = Object.values(this.cathegoriesBlog);
    private readonly store = inject(PostStore);
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);
    isLoading = this.store.loading;
    post: Post[] | null = null;
    editor!: Editor;
    toolbar: Toolbar = [
      // default value
      ["bold", "italic"],
      ["underline", "strike"],
      ["code", "blockquote"],
      ["ordered_list", "bullet_list"],
      [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
      ["link", "image"],
      ["text_color", "background_color"],
      ["align_left", "align_center", "align_right", "align_justify"],
    ];
    isEditorTextON: boolean = false;

  ngOnInit(): void {
    this.editor = new Editor();
    const id = this.id();
    if(id) {
      this.store.getOnePost(id);
    }
  }


    postFromSignal = computed(() => {
      this.post = this.store.post()
      if(this.post) {
        return this.formBuilder.group({
          id: this.post[0].id,
          created_at: this.post[0].created_at,
          titre: this.post[0].titre,
          description_meteo: this.post[0].description_meteo,
          phrase_accroche: this.post[0].phrase_accroche,
          article: this.post[0].article,
          citation: this.post[0].citation,
          comments: this.post[0].comments,
          lien_url_article: this.post[0].lien_url_article,
          image_url: this.post[0].image_url,
          categorie: this.post[0].categorie,
          visite: this.post[0].visite,
          valid: this.post[0].valid,
          deleted: this.post[0].deleted,
          video: this.post[0].video,
        });
      }
      return undefined;
    })

  get createdAtFormatted() {
    const createdAt = this.post && this.post[0] ? this.post[0].created_at : null;
    return createdAt ? new Date(createdAt).toLocaleDateString('fr-FR') : '';
  }
  onSubmit() {
    const postForm = this.postFromSignal();
    if (postForm && postForm.valid) {
      const { comments, ...postDataWithoutComments } = postForm.value;
      this.store.setOnePost(postDataWithoutComments as Post);
      this.router.navigate(['/home/all']); // Navigate to /home/all

    }
  }

  switchIsCode(event: any) {
    this.isEditorTextON = !this.isEditorTextON;
    event.preventDefault();
  }
}
