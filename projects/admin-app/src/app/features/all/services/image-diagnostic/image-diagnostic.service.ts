import { Injectable } from '@angular/core';
import { ImageChapitre } from '../../../../types/imageChapitre';
import {
    validateImage,
    generateImageValidationReport,
    isImageAlreadyInjected,
    countInjectedImages,
    ImageValidationResult
} from '../../../../utils/image-validation';

@Injectable({
  providedIn: 'root'
})
export class ImageDiagnosticService {

  constructor() { }

  /**
   * Effectue un diagnostic complet des images d'un post
   * @param postId - ID du post
   * @param articleContent - Contenu HTML de l'article
   * @param imagesChapitres - Images des chapitres
   * @returns Rapport de diagnostic détaillé
   */
  public diagnosePostImages(
    postId: number, 
    articleContent: string, 
    imagesChapitres: ImageChapitre[]
  ): {
    postId: number;
    timestamp: string;
    summary: {
      totalImages: number;
      imagesInArticle: number;
      imagesInjected: number;
      missingImages: number;
      injectionRate: number;
    };
    validation: {
      validImages: number;
      invalidImages: number;
      successRate: number;
      commonIssues: string[];
      recommendations: string[];
    };
    details: Array<{
      chapitre_id: number;
      image: ImageChapitre;
      validation: ImageValidationResult;
      isInjected: boolean;
      injectionStatus: 'success' | 'missing' | 'failed';
    }>;
    recommendations: string[];
  } {
    console.log(`[ImageDiagnosticService] 🔍 Début du diagnostic pour le post ${postId}`);
    
    const timestamp = new Date().toISOString();
    const imagesInArticle = countInjectedImages(articleContent);
    
    // Générer le rapport de validation
    const validationReport = generateImageValidationReport(imagesChapitres);
    
    // Analyser chaque image individuellement
    const details = imagesChapitres.map(image => {
      const validation = validateImage(image.url_Image, image.chapitre_key_word, image.chapitre_id);
      const isInjected = isImageAlreadyInjected(articleContent, image.chapitre_id);
      
      let injectionStatus: 'success' | 'missing' | 'failed' = 'missing';
      if (isInjected) {
        injectionStatus = 'success';
      } else if (validation.isValid) {
        injectionStatus = 'failed'; // Image valide mais pas injectée
      }
      
      return {
        chapitre_id: image.chapitre_id,
        image,
        validation,
        isInjected,
        injectionStatus
      };
    });
    
    // Calculer les statistiques
    const imagesInjected = details.filter(d => d.isInjected).length;
    const missingImages = details.filter(d => d.injectionStatus === 'missing').length;
    const injectionRate = imagesChapitres.length > 0 ? 
      Math.round((imagesInjected / imagesChapitres.length) * 100) : 0;
    
    // Générer des recommandations spécifiques
    const recommendations = this.generateRecommendations(details, validationReport);
    
    const diagnostic = {
      postId,
      timestamp,
      summary: {
        totalImages: imagesChapitres.length,
        imagesInArticle,
        imagesInjected,
        missingImages,
        injectionRate
      },
      validation: {
        validImages: validationReport.validImages,
        invalidImages: validationReport.invalidImages,
        successRate: validationReport.successRate,
        commonIssues: validationReport.commonIssues,
        recommendations: validationReport.recommendations
      },
      details,
      recommendations
    };
    
    console.log(`[ImageDiagnosticService] 📊 Diagnostic terminé pour le post ${postId}:`, {
      summary: diagnostic.summary,
      validation: diagnostic.validation,
      recommendationsCount: recommendations.length
    });
    
    return diagnostic;
  }

  /**
   * Génère des recommandations basées sur le diagnostic
   * @param details - Détails des images
   * @param validationReport - Rapport de validation
   * @returns Liste des recommandations
   */
  private generateRecommendations(
    details: Array<{
      chapitre_id: number;
      image: ImageChapitre;
      validation: ImageValidationResult;
      isInjected: boolean;
      injectionStatus: 'success' | 'missing' | 'failed';
    }>,
    validationReport: any
  ): string[] {
    const recommendations: string[] = [];
    
    // Recommandations basées sur l'injection
    const missingImages = details.filter(d => d.injectionStatus === 'missing');
    if (missingImages.length > 0) {
      recommendations.push(`🔧 ${missingImages.length} image(s) manquante(s) - Vérifier la logique d'injection`);
    }
    
    const failedImages = details.filter(d => d.injectionStatus === 'failed');
    if (failedImages.length > 0) {
      recommendations.push(`⚠️ ${failedImages.length} image(s) valide(s) mais non injectée(s) - Problème de logique d'injection`);
    }
    
    // Recommandations basées sur la validation
    if (validationReport.successRate < 100) {
      recommendations.push(`📈 Améliorer la qualité des images (${validationReport.successRate}% valides)`);
    }
    
    // Recommandations spécifiques par type de problème
    const nonSupabaseImages = details.filter(d => !d.validation.details.isSupabaseUrl);
    if (nonSupabaseImages.length > 0) {
      recommendations.push(`☁️ ${nonSupabaseImages.length} image(s) non hébergée(s) sur Supabase - Migrer vers Supabase Storage`);
    }
    
    const nonWebpImages = details.filter(d => !d.validation.details.isWebpFormat);
    if (nonWebpImages.length > 0) {
      recommendations.push(`🖼️ ${nonWebpImages.length} image(s) non optimisée(s) - Convertir en format WebP`);
    }
    
    const missingAltText = details.filter(d => !d.validation.details.hasValidAlt);
    if (missingAltText.length > 0) {
      recommendations.push(`♿ ${missingAltText.length} image(s) sans texte alternatif - Ajouter des descriptions accessibles`);
    }
    
    // Recommandations générales
    if (recommendations.length === 0) {
      recommendations.push('✅ Toutes les images sont correctement configurées et injectées');
    } else {
      recommendations.push('🔍 Consulter les logs détaillés pour plus d\'informations');
    }
    
    return recommendations;
  }

  /**
   * Vérifie la santé globale du système d'images
   * @param posts - Liste des posts à analyser
   * @returns Rapport de santé global
   */
  public checkSystemHealth(posts: Array<{
    id: number;
    article: string;
    images_chapitres: ImageChapitre[];
  }>): {
    timestamp: string;
    totalPosts: number;
    postsWithImages: number;
    totalImages: number;
    imagesInjected: number;
    globalInjectionRate: number;
    commonIssues: string[];
    systemStatus: 'healthy' | 'warning' | 'critical';
  } {
    console.log(`[ImageDiagnosticService] 🏥 Vérification de la santé du système pour ${posts.length} post(s)`);
    
    const timestamp = new Date().toISOString();
    const postsWithImages = posts.filter(p => p.images_chapitres && p.images_chapitres.length > 0).length;
    const totalImages = posts.reduce((sum, p) => sum + (p.images_chapitres?.length || 0), 0);
    
    let totalImagesInjected = 0;
    const allIssues: string[] = [];
    
    posts.forEach(post => {
      if (post.images_chapitres && post.images_chapitres.length > 0) {
        const imagesInArticle = countInjectedImages(post.article || '');
        totalImagesInjected += imagesInArticle;
        
        const diagnostic = this.diagnosePostImages(post.id, post.article || '', post.images_chapitres);
        allIssues.push(...diagnostic.validation.commonIssues);
      }
    });
    
    const globalInjectionRate = totalImages > 0 ? 
      Math.round((totalImagesInjected / totalImages) * 100) : 100;
    
    // Déterminer le statut du système
    let systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (globalInjectionRate < 50) {
      systemStatus = 'critical';
    } else if (globalInjectionRate < 80) {
      systemStatus = 'warning';
    }
    
    const commonIssues = [...new Set(allIssues)].slice(0, 10);
    
    const healthReport = {
      timestamp,
      totalPosts: posts.length,
      postsWithImages,
      totalImages,
      imagesInjected: totalImagesInjected,
      globalInjectionRate,
      commonIssues,
      systemStatus
    };
    
    console.log(`[ImageDiagnosticService] 🏥 Rapport de santé du système:`, {
      systemStatus,
      globalInjectionRate: `${globalInjectionRate}%`,
      totalImages,
      imagesInjected: totalImagesInjected,
      commonIssuesCount: commonIssues.length
    });
    
    return healthReport;
  }

  /**
   * Log un diagnostic détaillé dans la console
   * @param diagnostic - Résultat du diagnostic
   */
  public logDiagnostic(diagnostic: any): void {
    console.group(`[ImageDiagnosticService] 📋 Diagnostic du post ${diagnostic.postId}`);
    
    console.log('📊 Résumé:', diagnostic.summary);
    console.log('✅ Validation:', diagnostic.validation);
    console.log('🔧 Recommandations:', diagnostic.recommendations);
    
    console.group('🔍 Détails par image:');
    diagnostic.details.forEach((detail: any, index: number) => {
      console.group(`Image ${index + 1} (Chapitre ${detail.chapitre_id}):`);
      console.log('Status:', detail.injectionStatus);
      console.log('Injected:', detail.isInjected);
      console.log('Validation:', detail.validation);
      console.groupEnd();
    });
    console.groupEnd();
    
    console.groupEnd();
  }
}
