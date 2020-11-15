let token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXAiOiJhY2Nlc3MiLCJ1aWQiOiIyNTcyMmRjMy0zMGIxLTRlN2QtOGNiNy05MmRhYTgzZGUxOTgiLCJyb2wiOjEsImNsYiI6W10sImlhdCI6MTYwNTM0OTQ4OCwiZXhwIjoxNjA1MzQ5Nzg4fQ.M65tSGFELQ0L6f6rXY4isICWLAbrwVMSf-SmTnZvXXc';

export function getToken(): string {
  console.log('Token');
  return token;
}

export function setToken(_token: string): void {
  token = _token;
}
