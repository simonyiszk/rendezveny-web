import {
  ApolloClient,
  ApolloLink,
  from,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from 'apollo-link-context';
import fetch from 'isomorphic-fetch';

import { getAuthToken, getEventToken } from './TokenContainer';

const httpLink = new HttpLink({
  fetch,
  uri: process.env.GATSBY_SERVER_API_URL,
});

export const resetContext = (client: ApolloClient<object>) => {
  client.setLink(
    from([authMiddleware(getAuthToken(), getEventToken()), httpLink]),
  );
};

const authMiddleware = (authToken, eventToken) =>
  setContext((operation) => {
    if (!operation.operationName?.startsWith('e_') && authToken) {
      return {
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      };
    }
    if (eventToken) {
      return {
        headers: {
          authorization: `Bearer ${eventToken}`,
        },
      };
    }
    return {
      headers: {},
    };
  });

const cache = new InMemoryCache({
  typePolicies: {
    EventRelationDTO: {
      keyFields: ['userId'],
    },
  },
});

const useAppApolloClient = () => {
  const authToken = getAuthToken();
  const eventToken = getEventToken();
  return new ApolloClient({
    link: from([authMiddleware(authToken, eventToken), httpLink]),
    cache,
  });
};

export default useAppApolloClient;
