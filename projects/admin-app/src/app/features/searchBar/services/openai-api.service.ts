import { Injectable } from '@angular/core';
import {environment} from "../../../../../../../environment";
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
  async fetchData(prompt: any, deepseek: boolean) {
    const client = deepseek ? this.deepseek : this.openai;
    const completion = await client.chat.completions.create({
      messages: [
        prompt.systemRole,
        prompt.userRole
      ],
      model: deepseek ? "deepseek-chat" : "gpt-4o-mini"
    });

    // console.log('completion.choices[0]= '+ JSON.stringify(completion.choices[0]));
    return completion.choices[0].message.content
  }
}
