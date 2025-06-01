import {ChangeDetectionStrategy, Component, inject} from "@angular/core";
import {MatButtonModule} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {getFormattedFullDateTime} from "../../../../utils/getFormattedDate";

@Component({
  selector: 'app-dialog-delete-post-confirm',
  templateUrl: 'dialog-delete-comment-confirm.component.html',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogDeleteCommentConfirmComponent {
  data: any = inject(MAT_DIALOG_DATA);
  protected readonly getFormattedDate = getFormattedFullDateTime;
}
