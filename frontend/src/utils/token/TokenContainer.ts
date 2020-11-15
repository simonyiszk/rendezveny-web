const token = 'AUTH_TOKEN';

export function getToken(): string | null {
  return localStorage.getItem(token);
}

export function setToken(_token: string): void {
  localStorage.setItem(token, _token);
}
