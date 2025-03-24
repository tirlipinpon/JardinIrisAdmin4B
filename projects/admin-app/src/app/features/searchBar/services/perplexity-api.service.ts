import { Injectable } from '@angular/core';
import {environment} from "../../../../../../../environment";
import {extractJSONBlock} from "../../../utils/cleanJsonObject";


@Injectable({
  providedIn: 'root'
})
export class PerplexityApiService {

  fetchData(prompt: any): Promise<any> {
    const jsonObject = {
      model: "sonar-reasoning",
      messages: [
        prompt.systemRole,
        prompt.userRole
      ],
      max_tokens: 7000,
      temperature: 0.2,
      top_p: 0.9,
      return_citations: true,
      search_domain_filter: ["perplexity.ai"],
      return_images: false,
      return_related_questions: false,
      search_recency_filter: "month",
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1
    };
    const jsonString = JSON.stringify(jsonObject, null, 2);
    const options = {
      method: 'POST',
      headers: {Authorization: 'Bearer '+environment.perplexcityApi , 'Content-Type': 'application/json'},
      body: jsonString
    };

    // return this.MockgetMessageContent()
    return fetch('https://api.perplexity.ai/chat/completions', options)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.choices && data.choices.length > 0) {
          return extractJSONBlock(data.choices[0].message.content);
        } else {
          throw new Error('No choices available in the response');
        }
      })
      .catch(err => console.error(err));
  }
}
