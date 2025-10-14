// API helper placeholder
export async function api(path: string) {
  return fetch(path).then(r => r.json());
}
