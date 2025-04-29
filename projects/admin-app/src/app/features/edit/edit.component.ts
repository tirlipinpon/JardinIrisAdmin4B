import {Component, computed, inject, input, OnInit} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {PostStore} from "./store";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-edit',
  imports: [RouterOutlet, ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent implements OnInit {
    id = input<number>();
    private readonly store = inject(PostStore);
    private readonly formBuilder = inject(FormBuilder);
    isLoading = this.store.loading;
    postFromSignal = computed(() => {
       const post = this.store.post()
      if(post) {
        return this.formBuilder.group({
          id: post[0].id,
          created_at: post[0].created_at,
          titre: post[0].titre,
          description_meteo: post[0].description_meteo,
          phrase_accroche: post[0].phrase_accroche,
          article: post[0].article,
          citation: post[0].citation,
          comments: post[0].comments,
          lien_url_article: post[0].lien_url_article,
          image_url: post[0].image_url,
          categorie: post[0].categorie,
          visite: post[0].visite,
          valid: post[0].valid,
          deleted: post[0].deleted,
          video: post[0].video,
        })
      }
      return undefined;
    })

    ngOnInit(): void {
      const id = this.id();
      if(id) {
        this.store.getOnePost(id);
      }
    }


}
