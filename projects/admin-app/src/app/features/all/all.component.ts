import {AfterViewChecked, Component, computed, inject, OnInit} from '@angular/core';
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
export class AllComponent implements OnInit, AfterViewChecked {
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

  ngAfterViewChecked() {
    this.addClickEventAccordionArticle('accordion')
    this.addClickEventAccordionArticle('accordionComments')
  }

  getPostStatusClass(post: any): string {
    if (post.deleted) return 'post-deleted';
    if (post.valid === false) return 'post-invalid';
    return 'post-normal';
  }

  addClickEventAccordionArticle(classSelectorName: string) {
    // Récupérer tous les éléments ayant la classe "accordion"
    const acc: NodeListOf<HTMLElement> = document.querySelectorAll("."+classSelectorName);

    acc.forEach((button) => {
      button.addEventListener("click", () => {
        // Fermer tous les autres panels
        acc.forEach((otherButton) => {
          const otherPanel = otherButton.nextElementSibling as HTMLElement;
          if (otherButton !== button) {
            otherButton.classList.remove("active");
            otherPanel.style.display = "none";
          }
        });

        // Toggle la classe active sur l'élément cliqué
        button.classList.toggle("active");

        // Récupérer l'élément suivant dans le DOM (le panel)
        const panel = button.nextElementSibling as HTMLElement;

        // Vérifier si le panel est affiché et le masquer ou l'afficher
        if (panel.style.display === "block") {
          panel.style.display = "none";
        } else {
          panel.style.display = "block";
        }
      });
    });
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
