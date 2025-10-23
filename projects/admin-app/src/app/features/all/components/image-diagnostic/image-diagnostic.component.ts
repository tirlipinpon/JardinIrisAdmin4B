import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ImageDiagnosticService } from '../../services/image-diagnostic/image-diagnostic.service';
import { ImageChapitre } from '../../../../types/imageChapitre';

@Component({
  selector: 'app-image-diagnostic',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="image-diagnostic" *ngIf="diagnostic">
      <div class="diagnostic-header">
        <h3>🔍 Diagnostic des Images - Post {{diagnostic.postId}}</h3>
        <span class="timestamp">{{diagnostic.timestamp | date:'short'}}</span>
      </div>
      
      <div class="summary-cards">
        <div class="card">
          <h4>📊 Résumé</h4>
          <div class="stats">
            <div class="stat">
              <span class="label">Total images:</span>
              <span class="value">{{diagnostic.summary.totalImages}}</span>
            </div>
            <div class="stat">
              <span class="label">Injectées:</span>
              <span class="value success">{{diagnostic.summary.imagesInjected}}</span>
            </div>
            <div class="stat">
              <span class="label">Manquantes:</span>
              <span class="value error">{{diagnostic.summary.missingImages}}</span>
            </div>
            <div class="stat">
              <span class="label">Taux d'injection:</span>
              <span class="value" [class]="getInjectionRateClass()">{{diagnostic.summary.injectionRate}}%</span>
            </div>
          </div>
        </div>
        
        <div class="card">
          <h4>✅ Validation</h4>
          <div class="stats">
            <div class="stat">
              <span class="label">Images valides:</span>
              <span class="value success">{{diagnostic.validation.validImages}}</span>
            </div>
            <div class="stat">
              <span class="label">Images invalides:</span>
              <span class="value error">{{diagnostic.validation.invalidImages}}</span>
            </div>
            <div class="stat">
              <span class="label">Taux de validation:</span>
              <span class="value" [class]="getValidationRateClass()">{{diagnostic.validation.successRate}}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="recommendations" *ngIf="diagnostic.recommendations.length > 0">
        <h4>🔧 Recommandations</h4>
        <ul>
          <li *ngFor="let rec of diagnostic.recommendations">{{rec}}</li>
        </ul>
      </div>
      
      <div class="image-details">
        <h4>🔍 Détails par Image</h4>
        <div class="image-list">
          <div *ngFor="let detail of diagnostic.details; let i = index" 
               class="image-item" 
               [class]="getImageItemClass(detail)">
            <div class="image-header">
              <span class="chapitre-id">Chapitre {{detail.chapitre_id}}</span>
              <span class="status" [class]="detail.injectionStatus">
                {{getStatusText(detail.injectionStatus)}}
              </span>
            </div>
            
            <div class="image-info">
              <div class="url">
                <strong>URL:</strong> 
                <a [href]="detail.image.url_Image" target="_blank" class="url-link">
                  {{detail.image.url_Image}}
                </a>
              </div>
              <div class="alt-text">
                <strong>Alt:</strong> {{detail.image.chapitre_key_word || 'Non défini'}}
              </div>
            </div>
            
            <div class="validation-details" *ngIf="!detail.validation.isValid">
              <h5>⚠️ Problèmes détectés:</h5>
              <ul>
                <li *ngFor="let issue of detail.validation.issues">{{issue}}</li>
              </ul>
            </div>
            
            <div class="validation-details" *ngIf="detail.validation.recommendations.length > 0">
              <h5>💡 Recommandations:</h5>
              <ul>
                <li *ngFor="let rec of detail.validation.recommendations">{{rec}}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .image-diagnostic {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .diagnostic-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #007bff;
    }
    
    .diagnostic-header h3 {
      margin: 0;
      color: #007bff;
    }
    
    .timestamp {
      color: #6c757d;
      font-size: 0.9em;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .card {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 15px;
    }
    
    .card h4 {
      margin: 0 0 15px 0;
      color: #495057;
    }
    
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f8f9fa;
    }
    
    .stat:last-child {
      border-bottom: none;
    }
    
    .label {
      font-weight: 500;
      color: #6c757d;
    }
    
    .value {
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .value.success {
      background: #d4edda;
      color: #155724;
    }
    
    .value.error {
      background: #f8d7da;
      color: #721c24;
    }
    
    .value.warning {
      background: #fff3cd;
      color: #856404;
    }
    
    .recommendations {
      background: #e7f3ff;
      border: 1px solid #b8daff;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
    }
    
    .recommendations h4 {
      margin: 0 0 10px 0;
      color: #004085;
    }
    
    .recommendations ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .recommendations li {
      margin-bottom: 5px;
      color: #004085;
    }
    
    .image-details h4 {
      margin: 0 0 15px 0;
      color: #495057;
    }
    
    .image-list {
      display: grid;
      gap: 15px;
    }
    
    .image-item {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 15px;
    }
    
    .image-item.success {
      border-left: 4px solid #28a745;
    }
    
    .image-item.warning {
      border-left: 4px solid #ffc107;
    }
    
    .image-item.error {
      border-left: 4px solid #dc3545;
    }
    
    .image-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .chapitre-id {
      font-weight: bold;
      color: #495057;
    }
    
    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9em;
      font-weight: bold;
    }
    
    .status.success {
      background: #d4edda;
      color: #155724;
    }
    
    .status.missing {
      background: #f8d7da;
      color: #721c24;
    }
    
    .status.failed {
      background: #fff3cd;
      color: #856404;
    }
    
    .image-info {
      margin-bottom: 10px;
    }
    
    .image-info div {
      margin-bottom: 5px;
    }
    
    .url-link {
      color: #007bff;
      text-decoration: none;
      word-break: break-all;
    }
    
    .url-link:hover {
      text-decoration: underline;
    }
    
    .validation-details {
      margin-top: 10px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    
    .validation-details h5 {
      margin: 0 0 8px 0;
      font-size: 0.9em;
      color: #495057;
    }
    
    .validation-details ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .validation-details li {
      margin-bottom: 3px;
      font-size: 0.9em;
      color: #6c757d;
    }
    
    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }
      
      .stats {
        grid-template-columns: 1fr;
      }
      
      .image-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }
    }
  `]
})
export class ImageDiagnosticComponent implements OnInit {
  @Input() postId!: number;
  @Input() articleContent: string = '';
  @Input() imagesChapitres: ImageChapitre[] = [];
  
  diagnostic: any = null;

  constructor(private imageDiagnostic: ImageDiagnosticService) {}

  ngOnInit() {
    if (this.postId && this.articleContent && this.imagesChapitres) {
      this.runDiagnostic();
    }
  }

  runDiagnostic() {
    this.diagnostic = this.imageDiagnostic.diagnosePostImages(
      this.postId,
      this.articleContent,
      this.imagesChapitres
    );
  }

  getInjectionRateClass(): string {
    if (!this.diagnostic) return '';
    const rate = this.diagnostic.summary.injectionRate;
    if (rate === 100) return 'success';
    if (rate >= 80) return 'warning';
    return 'error';
  }

  getValidationRateClass(): string {
    if (!this.diagnostic) return '';
    const rate = this.diagnostic.validation.successRate;
    if (rate === 100) return 'success';
    if (rate >= 80) return 'warning';
    return 'error';
  }

  getImageItemClass(detail: any): string {
    return detail.injectionStatus;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'success': return '✅ Injectée';
      case 'missing': return '❌ Manquante';
      case 'failed': return '⚠️ Échec';
      default: return '❓ Inconnu';
    }
  }
}
