// const btoa = (str: string): string => Buffer.from(str).toString('base64');

const authToken = 'SIMONYI_RENDEZVENY_AUTH_TOKEN';
const eventToken = 'SIMONYI_RENDEZVENY_EVENT_TOKEN';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(authToken);
  }
  return null;
}

export function setAuthToken(_token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(authToken, _token);
  }
}

export function getEventToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(eventToken);
  }
  return null;
}

export function setEventToken(_token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(eventToken, _token);
  }
}

export function resetTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(authToken);
    localStorage.removeItem(eventToken);
  }
}
