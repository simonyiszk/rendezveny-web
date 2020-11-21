import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';

import { getAuthToken, getEventToken } from './TokenContainer';

const httpLink = new HttpLink({ uri: 'http://localhost:3000/api/v1' });

const eventQueries = ['eventGetOne'];

const authMiddleware = (authToken, eventToken) =>
  new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    console.log('operation', operation);
    console.log('forward', forward);
    if (!eventQueries.includes(operation.operationName) && authToken) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });
    } else if (eventToken) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${eventToken}`,
        },
      });
    }
    return forward(operation);
  });

const cache = new InMemoryCache({});

const useAppApolloClient = () => {
  const authToken = getAuthToken();
  const eventToken = getEventToken();
  console.log('APOLLO AUTH', authToken);
  console.log('APOLLO EVENT', eventToken);
  return new ApolloClient({
    link: authMiddleware(authToken, eventToken).concat(httpLink),
    cache,
  });
};

export default useAppApolloClient;
