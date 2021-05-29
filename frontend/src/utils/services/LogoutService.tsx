import { resetTokens } from '../token/TokenContainer';

export default function useLogoutService(_client: any) {
  return function getLogoutService(): void {
    resetTokens();
  };
}
