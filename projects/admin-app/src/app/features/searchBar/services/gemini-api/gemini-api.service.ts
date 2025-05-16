import { Injectable } from '@angular/core';
import { GoogleGenAI, Modality } from '@google/genai';
import {environment} from "../../../../../../../../environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  public imageUrl: string | null = null;
  public isLoading = false;
  public errorMessage: string | null = null;

  constructor(private http: HttpClient) { }

  async generateImage(prompt: string) {
    const apiKey = environment.geminiApi;
    const model = "models/imagen-3.0-generate-002";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:predict?key=${apiKey}`;
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = {
        instances: [{ prompt }]
      };
      return this.http.post(endpoint, body, { headers });

  }


  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
  }
}
