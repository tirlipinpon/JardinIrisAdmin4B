import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-dialog-edit-image-chapitre-article',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle
  ],
  templateUrl: './dialog-edit-image-chapitre-article.component.html'
})
export class DialogEditImageChapitreArticleComponent {
  data: any = inject(MAT_DIALOG_DATA);

}
