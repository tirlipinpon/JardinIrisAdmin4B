import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {GoogleSearchService} from "../google-search/google-search.service";
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from "@angular/material/card";
import {CommonModule} from "@angular/common";
interface ImageData {
  link: string;
  mime: string;
  width: number;
  height: number;
  byteSize: number;
}
@Component({
  selector: 'app-dialog-edit-image-chapitre-article',
  imports: [
    CommonModule,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    MatFormField,
    MatInput,
    MatCard,
    MatCardContent,
    MatCardActions,
    MatCardImage
  ],
  templateUrl: './dialog-edit-image-chapitre-article.component.html'
})
export class DialogEditImageChapitreArticleComponent {
  data: any = inject(MAT_DIALOG_DATA);
  searchText: string = '';
  rawIMages: ImageData[] = [];
  selectedUrl: string = ""

  constructor(private googleSearchService: GoogleSearchService) {
  }

  onSearch() {
     this.googleSearchService.searchImage(this.searchText).subscribe(res => {
       this.rawIMages = res;
     });
  }

  selectImage(imageLink: string) {
    console.log('Image sélectionnée :', imageLink);
    this.selectedUrl = imageLink;
  }



}
