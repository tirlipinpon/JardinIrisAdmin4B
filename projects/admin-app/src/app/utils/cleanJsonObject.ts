export function extractJSONBlock(input: string): string {
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
