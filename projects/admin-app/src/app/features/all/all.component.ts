import {AfterViewChecked, Component, computed, inject, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {PostStore} from "../edit/store";
import {Post} from "../../types/post";
import {FormBuilder} from "@angular/forms";
import { CommonModule } from '@angular/common';
import {MatFormField} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatDialog} from "@angular/material/dialog";
import {
  DialogDeleteCommentConfirmComponent
} from "../../shared/dialog/delete-comment-confirm/dialog-delete-comment-confirm.component";
import {Comment} from "../../types/comment";
import {
  DialogDeletePostConfirmComponent
} from "../../shared/dialog/delete-post-confirm/dialog-delete-post-confirm.component";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-all',
  imports: [RouterLink, CommonModule, MatFormField, MatSelect, MatOption],
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})
export class AllComponent implements OnInit, AfterViewChecked {
  private readonly store = inject(PostStore);
  post: Post[] | null = null;
  private readonly formBuilder = inject(FormBuilder);
  isLoading = this.store.loading;
  matSelectedOption: string = "";
  readonly dialogDeleteConfirm = inject(MatDialog);

  constructor(private sanitizer: DomSanitizer) { }

  postFromSignal = computed(() => {
    return this.store.post()
  })


  ngOnInit(): void {
      this.store.getPostWithComments({id: null, orderBySelected: 'created_at'});
  }

  ngAfterViewChecked() {
    this.addClickEventAccordionArticle('accordion')
    this.addClickEventAccordionArticle('accordionComments')
  }

  triggerSelectChange(valueSelected: any) {
    this.matSelectedOption = valueSelected.value;
    this.store.getPostWithComments({id: null, orderBySelected: valueSelected.value}
    );
  }

  getPostStatusClass(post: Post): string {
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

  openDialogDeleteComment(comment: Comment) {
    const dialogRef = this.dialogDeleteConfirm.open(DialogDeleteCommentConfirmComponent, {
      data: {
        comment: comment,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.deleteComment(comment.id)
      }
    });
  }

  openDialogDeletePost(post: Post) {
    const dialogRef = this.dialogDeleteConfirm.open(DialogDeletePostConfirmComponent, {
      data: {
        post: post,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result && post.id) {
        this.store.deletePost(post.id)
      }
    });
  }


  deletePost(post: Post) {
    this.openDialogDeletePost(post)
  }

  validPostById(id: any) {
    this.store.validPost(id)
  }

  getValidCommentsCount(comments: any) {
    return comments ? comments.filter((comment: Comment) => comment.valide).length : 0;
  }

  deleteCommentById(comment: Comment) {
    this.openDialogDeleteComment(comment)
  }

  valideCommentById(comment: any) {
    this.store.validComment(comment.id)
  }

  processedArticleHtml(id: number, article: string, images: any[]) {
    if (id === undefined) return '';
    // Créer un élément DOM temporaire pour manipuler le HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article;

    // Trouver tous les spans avec ID paragraphe-X
    const paragraphs = tempDiv.querySelectorAll('span[id^="paragraphe-"]');

    paragraphs.forEach(paragraph => {
      // Extraire le numéro du paragraphe
      const paragraphId = paragraph.id;
      const paragraphNumber = parseInt(paragraphId.split('-')[1]);

      // Trouver l'image correspondante
      const matchingImage = images.find(img =>
        img.chapitre_id === paragraphNumber
      );

      if (matchingImage) {
        // Trouver le premier h4 dans ce paragraphe
        const h4 = paragraph.querySelector('h4');

        if (h4) {
          // Créer l'élément image
          const imgElement = document.createElement('img');
          imgElement.src = matchingImage.url_Image;
          imgElement.alt = matchingImage.chapitre_key_word || '';
          imgElement.className = 'randomCropImage';
          imgElement.style.cssText = 'width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px;';

          // Insérer l'image après le h4
          h4.insertAdjacentElement('afterend', imgElement);
        }
      }
    });

    // Sanitize le HTML modifié pour éviter les problèmes de sécurité
    return this.sanitizer.bypassSecurityTrustHtml(tempDiv.innerHTML);
  }

}
