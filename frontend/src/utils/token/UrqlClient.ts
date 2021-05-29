import { makeOperation } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import {
  cacheExchange,
  createClient,
  dedupExchange,
  fetchExchange,
} from 'urql';

import { getAuthToken, getEventToken } from './TokenContainer';

interface AuthState {
  authToken: string | null;
  eventToken: string | null;
}
interface HeaderToken {
  authorization?: string;
}

const getToken = (operationName: string, authState: AuthState): HeaderToken => {
  if (!operationName?.startsWith('e_') && authState.authToken) {
    console.log('token auth');
    return {
      authorization: `Bearer ${authState.authToken}`,
    };
  }
  if (authState.eventToken) {
    console.log('token event');
    return {
      authorization: `Bearer ${authState.eventToken}`,
    };
  }
  console.log('token none');
  return {};
};

export default createClient({
  url: process.env.GATSBY_SERVER_API_URL!,
  exchanges: [
    dedupExchange,
    cacheExchange,
    authExchange<AuthState>({
      addAuthToOperation: ({ authState, operation }) => {
        if (!authState) {
          return operation;
        }

        // fetchOptions can be a function (See Client API) but you can simplify this based on usage
        const fetchOptions =
          typeof operation.context.fetchOptions === 'function'
            ? operation.context.fetchOptions()
            : operation.context.fetchOptions || {};

        console.log('OPERATIONNAME', operation.query.definitions[0].name.value);
        const token = getToken(operation.query.definitions[0].name.value, {
          authToken: getAuthToken(),
          eventToken: getEventToken(),
        });
        const result = makeOperation(operation.kind, operation, {
          ...operation.context,
          fetchOptions: {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              ...token,
            },
          },
        });
        console.log('OPERATION', result.context.fetchOptions);
        return result;
      },
      willAuthError: ({ authState }) => {
        if (!authState) return true;
        // e.g. check for expiration, existence of auth etc
        return false;
      },
      didAuthError: ({ error }) => {
        // check if the error was an auth error (this can be implemented in various ways, e.g. 401 or a special error code)
        console.log('AUTHEXERROR', error);
        return error.graphQLErrors.some(
          (e) => e.extensions?.code === 'FORBIDDEN',
        );
      },
      getAuth: async ({ authState: _a, mutate: _m }) => {
        return { authToken: getAuthToken(), eventToken: getEventToken() };
      },
    }),
    fetchExchange,
  ],
});
