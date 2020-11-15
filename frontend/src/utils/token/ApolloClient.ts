import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';

import { getToken } from './TokenContainer';

const httpLink = new HttpLink({ uri: 'http://localhost:3000/api/v1' });

const authMiddleware = (authToken) =>
  new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    if (authToken) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });
    }

    return forward(operation);
  });

const cache = new InMemoryCache({});

const useAppApolloClient = () => {
  const authToken = getToken();
  return new ApolloClient({
    link: authMiddleware(authToken).concat(httpLink),
    cache,
  });
};

export default useAppApolloClient;
