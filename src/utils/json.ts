

export function parseJsonResponse(response: string) {
  const cleaned = response
    .replace(/```json\s*/i, "")
    .replace(/```$/, "")
    .trim();

  return JSON.parse(cleaned);
}

