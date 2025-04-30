import {ChangeDetectionStrategy, Component, inject} from "@angular/core";
import {MatButtonModule} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {NgIf} from "@angular/common";
import {Router} from "@angular/router";

@Component({
  selector: 'app-dialog',
  templateUrl: 'dialog.component.html',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  data = inject(MAT_DIALOG_DATA);

  constructor(private router: Router) {}
  redirectTo(url: string) {
    this.router.navigate(['/get-all-pos']);
  }
}
