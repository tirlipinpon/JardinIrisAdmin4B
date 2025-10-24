import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  computed, inject,
  OnDestroy,
  OnInit, Renderer2,
  ViewEncapsulation
} from '@angular/core';
import { RouterLink } from "@angular/router";
import { PostStore } from "../edit/store";
import { Post } from "../../types/post";
import { FormBuilder } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { MatFormField } from "@angular/material/form-field";
import { MatOption, MatSelect } from "@angular/material/select";
import { MatDialog } from "@angular/material/dialog";
import {
  DialogDeleteCommentConfirmComponent
} from "./services/delete-comment-confirm/dialog-delete-comment-confirm.component";
import { Comment } from "../../types/comment";
import {
  DialogDeletePostConfirmComponent
} from "./services/delete-post-confirm/dialog-delete-post-confirm.component";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { DialogEditVideoConfirmComponent } from "./services/edit-video-chapitre-confirm/dialog-edit-video-confirm.component";
import {
  DialogEditImageChapitreArticleComponent
} from "./services/dialog-edit-image-chapitre-article/dialog-edit-image-chapitre-article.component";
import { SearchInfrastructure } from "../../shared/search-infrastructure/search.infrastructure";
import { PostImageInjectorService } from "./services/post-image-injector/post-image-injector.service";
import { PostValidationService } from "./services/post-validation/post-validation.service";

@Component({
  selector: 'app-all',
  imports: [RouterLink, CommonModule, MatFormField, MatSelect, MatOption],
  templateUrl: './all.component.html',
  styleUrl: './all.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AllComponent implements OnInit, AfterViewChecked, OnDestroy, AfterViewInit {
  private readonly store = inject(PostStore);
  private readonly searchInfra = inject(SearchInfrastructure);
  private readonly postImageInjector = inject(PostImageInjectorService);
  private readonly postValidation = inject(PostValidationService);
  post: Post[] | null = null;
  private readonly formBuilder = inject(FormBuilder);
  isLoading = this.store.loading;
  matSelectedOption: string = "";
  readonly dialogConfirm = inject(MatDialog);
  clickListener: any;
  // Map pour suivre l'état d'affichage de chaque vidéo (par ID de post)
  videoVisibilityMap = new Map<string | number, boolean>();
  private vegetalInitAttempts = 0;

  constructor(private sanitizer: DomSanitizer, private renderer: Renderer2) { }

  postFromSignal = computed(() => {
    return this.store.post()
  })


  ngOnInit(): void {
    this.store.getPostWithCommentsAndImages({id: null, orderBySelected: 'created_at'});
    // Ajouter un écouteur d'événement global pour les clics sur les videos
    this.clickListener = this.handleVideoClick.bind(this);
    document.addEventListener('click', this.clickListener)
  }

  ngAfterViewChecked() {
    this.addClickEventAccordionArticle('accordion')
    this.addClickEventAccordionArticle('accordionComments')
  }

  ngAfterViewInit(): void {
    this.initializeVegetalElements();
  }

  ngOnDestroy() {
    // Nettoyer l'écouteur d'événement lors de la destruction du composant
    document.removeEventListener('click', this.clickListener);
  }

  private initializeVegetalElements(): void {
    const vegeElements = document.querySelectorAll('.inat-vegetal');

    if (vegeElements.length === 0) {
      if (this.vegetalInitAttempts < 10) {
        this.vegetalInitAttempts++;
        console.log(`Tentative ${this.vegetalInitAttempts}/10 : pas encore d'éléments .inat-vegetal`);
        setTimeout(() => this.initializeVegetalElements(), 500);
      } else {
        console.warn("Abandon après 10 tentatives.");
      }
      return;
    }

    console.log(`${vegeElements.length} éléments .inat-vegetal trouvés, initialisation...`);

    vegeElements.forEach((element: any) => {
      const tooltip = element.querySelector('.inat-vegetal-tooltip') as HTMLElement;
      const img = tooltip?.querySelector('img');
      if (!tooltip || !img) return;

      if (!tooltip.querySelector('.taxon-name')) {
        const taxonName = element.getAttribute('data-taxon-name') || img.alt || 'Nom inconnu';
        const nameBox = this.renderer.createElement('div');
        this.renderer.addClass(nameBox, 'taxon-name');
        nameBox.textContent = taxonName;
        this.renderer.appendChild(tooltip, nameBox);
      }

      const adjustTooltipPosition = () => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.bottom > windowHeight / 1.5) {
          tooltip.classList.add('inat-vegetal-tooltip-above');
        } else {
          tooltip.classList.remove('inat-vegetal-tooltip-above');
        }
      };

      adjustTooltipPosition();
      window.addEventListener('scroll', adjustTooltipPosition);

      element.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 768) {
          tooltip.style.display = 'block';
        }
      });

      element.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 768) {
          tooltip.style.display = 'none';
        }
      });

      element.addEventListener('click', (e: MouseEvent) => {
        if (window.innerWidth < 768) {
          e.preventDefault();
          element.classList.toggle('active');
        }
      });
    });

    document.addEventListener('click', (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.inat-vegetal')) {
        document.querySelectorAll('.inat-vegetal.active')
          .forEach((el: any) => el.classList.remove('active'));
      }
    });
  }

  // Méthode pour basculer l'affichage d'une vidéo spécifique
  toggleVideoDisplay(postId: string | number | undefined): void {
    if (postId === undefined) return;
    const currentValue = this.videoVisibilityMap.get(postId) || false;
    this.videoVisibilityMap.set(postId, !currentValue);
  }

// Méthode pour vérifier si une vidéo est visible
  isVideoVisible(postId: string | number | undefined): boolean {
    if (postId === undefined) return false;
    return this.videoVisibilityMap.get(postId) || false;
  }

  triggerSelectChange(valueSelected: any) {
    this.matSelectedOption = valueSelected.value;
    this.store.getPostWithCommentsAndImages({id: null, orderBySelected: valueSelected.value}
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
    const dialogRef = this.dialogConfirm.open(DialogDeleteCommentConfirmComponent, {
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
    const dialogRef = this.dialogConfirm.open(DialogDeletePostConfirmComponent, {
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
  openDialogEditVideoById(id: number, url: string | null) {
    const dialogRef = this.dialogConfirm.open(DialogEditVideoConfirmComponent, {
      data: {
        id: id,
        url: url,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result.confirmed && id) {
        this.store.editPostVideo({ id, idYoutube: result.idYoutube })
      }
    });
  }
  openDialogEditImagesChapitreArticleById(imgElement: any, imageId: number, postId: number) {
    const dialogRef = this.dialogConfirm.open(DialogEditImageChapitreArticleComponent, {
      data: {
        imgElement: imgElement,
        postId: postId,
        imageId: imageId,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result.confirmed && result.selectedUrl) {
        this.store.editImagesChapitreArticle({ idImage: imageId, url: result.selectedUrl, searchText: result.searchText, idPost: postId })
      }
    });
  }

  deletePost(post: Post) {
    this.openDialogDeletePost(post)
  }

  validPostById(id: number | undefined): void {
    if (!id) {
      console.error('ID du post manquant');
      return;
    }
    this.postValidation.validatePost(id).subscribe({
      next: (success) => {
        if (success) {
          console.log(`[validPostById] ✓ Post ${id} validé avec succès`);
        }
      },
      error: (error) => {
        console.error(`[validPostById] ❌ Erreur lors de la validation du post ${id}:`, error);
        alert('Erreur lors de la validation du post. Veuillez réessayer.');
      }
    });
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

  addImagesChapitreArticle(postId: number | undefined, article: string, images: any[]) {
    if (postId === undefined) return '';

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
        // Trouver le premier h4 dans ce paragraphe
        const h4 = paragraph.querySelector('h4');
        if (h4) {
          // Créer l'élément image
          const imgElement = document.createElement('img');
          imgElement.src = matchingImage?.url_Image ||  "https://www.picturethisai.com/fr/care/Aloe_polyphylla.html";
          imgElement.alt = matchingImage?.chapitre_key_word || 'jardin iris jardinier paysagiste Bruxelles';
          imgElement.className = 'randomCropImage clickable-image'; // Ajout d'une classe pour cibler plus facilement
          imgElement.style.cssText = 'width: 100%; height: 200px; object-fit: cover; border: 3px solid grey; padding: 1px; margin: 0px 0px 30px; cursor: pointer;'; // Ajout du cursor: pointer
          // Stocker l'ID de l'image comme attribut data
          imgElement.setAttribute('data-image-id', matchingImage?.id.toString());
          imgElement.setAttribute('data-post-id', postId.toString());
          // Insérer l'image après le h4
          h4.insertAdjacentElement('afterend', imgElement);
        }
    });
    return this.sanitizer.bypassSecurityTrustHtml(tempDiv.innerHTML);
  }

  onArticleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'img' && target.classList.contains('clickable-image')) {
      const imageId = target.getAttribute('data-image-id');
      const postId = target.getAttribute('data-post-id');
      if (imageId) {
        console.log('Image cliquée avec ID:', imageId);
        this.openDialogEditImagesChapitreArticleById(target, Number(imageId), Number(postId));
      }
    }
  }

  handleVideoClick(event: Event) {
    const target = event.target as HTMLElement;

    // Vérifier si l'élément cliqué est une image avec notre classe spéciale
    if (target.tagName === 'BUTTON' && target.classList.contains('clickable-video')) {
      // Récupérer l'ID de l'image depuis l'attribut data
      const postId = target.getAttribute('data-post-id');
      const videoUrl = target.getAttribute('data-video-url');

      if (postId) {
        // Appeler votre fonction avec l'ID de l'image
        this.openDialogEditVideoById(parseInt(postId), videoUrl);
      }
    }
  }

  getSafeUrl(videoUrl: string | null | undefined): SafeResourceUrl {
    if (!videoUrl) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    let videoId = '';
    // Gérer les formats d'URL YouTube comme:
    // https://www.youtube.com/watch?v=n7lUCZYx-6U
    // https://youtu.be/n7lUCZYx-6U
    if (videoUrl.includes('youtube.com/watch?v=')) {
      const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    } else {
      videoId = videoUrl;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + videoId);
  }


}