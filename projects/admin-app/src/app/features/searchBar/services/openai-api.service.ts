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
  async fetchData(prompt: any) {
    const completion = await this.openai.chat.completions.create({
      messages: [
        prompt.systemRole,
        prompt.userRole
      ],
      model: "gpt-4o-mini"
    });

    // console.log('completion.choices[0]= '+ JSON.stringify(completion.choices[0]));
    return completion.choices[0].message.content
  }
}
