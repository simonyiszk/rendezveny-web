import { ApolloClient } from '@apollo/client';

import { resetContext } from '../token/ApolloClient';
import { resetTokens } from '../token/TokenContainer';

export default function useLogoutService(client: ApolloClient<object>) {
  return function getLogoutService(): void {
    resetTokens();
    resetContext(client);
  };
}
