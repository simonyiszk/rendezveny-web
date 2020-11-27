const authToken = 'SIMONYI_RENDEZVENY_AUTH_TOKEN';
const eventToken = 'SIMONYI_RENDEZVENY_EVENT_TOKEN';

export function getAuthToken(): string | null {
  return localStorage.getItem(authToken);
}

export function setAuthToken(_token: string): void {
  localStorage.setItem(authToken, _token);
}

export function getEventToken(): string | null {
  return localStorage.getItem(eventToken);
}

export function setEventToken(_token: string): void {
  localStorage.setItem(eventToken, _token);
}

export function resetTokens(): void {
  localStorage.removeItem(authToken);
  localStorage.removeItem(eventToken);
}
