import { Injectable } from '@angular/core';
import {environment} from "../../../../../../../../environment";
import OpenAI from "openai";

@Injectable({
  providedIn: 'root'
})
export class OpenaiApiService {
  openai = new OpenAI({
    dangerouslyAllowBrowser: true,
    apiKey: environment.openAiApiKey
  });
  deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    dangerouslyAllowBrowser: true,
    apiKey: environment.deepseekApi
  });
  gemini = new OpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    dangerouslyAllowBrowser: true,
    apiKey: environment.geminiApi
  });
  async fetchData(prompt: any, deepseek?: boolean) {
    const client = deepseek ? this.deepseek : this.openai;
    const completion = await client.chat.completions.create({
      messages: [
        prompt.systemRole,
        prompt.userRole
      ],
      model: deepseek ? "deepseek-reasoner" : "gpt-5-mini-2025-08-07"
    });

    // console.log('completion.choices[0]= '+ JSON.stringify(completion.choices[0]));
    return completion.choices[0].message.content
  }

  async fetchDataImage(prompt: any, regularUrls: string[]) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        prompt.systemRole,
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt.userRole.content,
            },
            ...regularUrls.map((url) => ({
              type: "image_url",
              image_url: { url },
            })),
          ],
        }],
    });
    // console.log('completion.choices[0]= '+ JSON.stringify(completion.choices[0]));
    return completion.choices[0].message.content
  }

  async imageGenerator_b64_json(promptText: any) {
    const image =
      await this.openai.images.generate({
        model: "dall-e-3",
        prompt: promptText,
        n:1,
        size:"1024x1024",
        response_format: "b64_json"
      });
    if (!image.data || image.data.length === 0) {
      throw new Error("Aucune image n'a été générée");
    }
    return image.data[0].b64_json;
  }

  async imageGeneratorUrl(promptText: string) {
    const image = await this.openai.images.generate({
      model: "gpt-image-1",
      prompt: promptText,
      n: 1,
      size: "1024x1024"
    });

    if (!image.data || image.data.length === 0) {
      throw new Error("Aucune image n'a été générée");
    }

    return image.data[0].b64_json;
  }


  async imageGeneratorGemini(promptText: any) {
    const image = await this.gemini.images.generate(
      {
        model: "imagen-3.0-generate-002",
        prompt: promptText,
        response_format: "b64_json",
        n: 1,
      }
    );

    console.log(image.data);
  }




}
