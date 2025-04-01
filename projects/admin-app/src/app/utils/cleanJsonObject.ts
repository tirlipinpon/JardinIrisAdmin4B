export function extractJSONBlock(input: any): string {
  const regex = /```json\s([\s\S]*?)\s```/;
  const match = input.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return input; // Si aucun bloc JSON trouvé,
}

export function extractHTMLBlock(input: string): string {
  const regex = /```html\s([\s\S]*?)\s```/;
  const match = input.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return input; // Si aucun bloc JSON trouvé,
}

export function  parseJsonSafe(jsonString: string | null): any | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Invalid JSON string:', jsonString);
    return null;
  }
}
