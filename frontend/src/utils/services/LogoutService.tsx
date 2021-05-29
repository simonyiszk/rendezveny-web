import { resetTokens } from '../token/TokenContainer';

export default function useLogoutService(client: any) {
  return function getLogoutService(): void {
    resetTokens();
  };
}
