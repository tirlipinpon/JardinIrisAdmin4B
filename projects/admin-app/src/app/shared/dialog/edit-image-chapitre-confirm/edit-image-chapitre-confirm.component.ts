import {ChangeDetectionStrategy, Component, inject} from "@angular/core";
import {MatButtonModule} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {GoogleSearchService} from "../../google-search/google-search.service";
import {MatCardActions, MatCardContent, MatCardHeader, MatCardModule} from "@angular/material/card";
import {CommonModule} from "@angular/common";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-dialog-edit-image-chapitre-confirm',
  templateUrl: 'edit-image-chapitre-confirm.component.html',
  styles: [
    `
      .selected-card {
        border: 3px solid #3f51b5;
        box-shadow: 0 4px 12px rgba(63, 81, 181, 0.5);
        transition: all 0.3s ease;
      }

      .selection-info {
        margin-top: 10px;
        padding: 10px;
        background-color: #f1f1f1;
        border-radius: 5px;
      }

      .video-container iframe {
        width: 100%;
        height: 315px;
      }
    `
  ],
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatFormField,
    MatInput,
    FormsModule,
    MatCardModule,
    MatCardHeader,
    MatCardContent,
    MatCardActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditImageChapitreConfirmComponent {
  data: any = inject(MAT_DIALOG_DATA);
  googleSearchService: any = inject(GoogleSearchService);
  rawVideos: any[] = [];
  selectedVideoId: string | null = null;
  searchText: string = 'voiture porche rouge';

  constructor(private sanitizer: DomSanitizer) {}

  getSafeUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + videoId);
  }

  selectVideo(videoId: string): void {
    this.selectedVideoId = videoId;
  }

  clearSelection(): void {
    this.selectedVideoId = null;
  }

  onSearch() {
    console.log(this.searchText);
    this.googleSearchService.searchFrenchVideo(this.searchText).subscribe((res: any) => {
      console.log(res);
      this.rawVideos = this.removeDuplicates(res)
      console.log(this.rawVideos);
    })
  }

  removeDuplicates(videos: any[]): any[] {
    const seen = new Set();
    return videos.filter(video => {
      if (seen.has(video.videoId)) {
        return false;
      }
      seen.add(video.videoId);
      return true;
    });
  }
}
