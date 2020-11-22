import {
  ApolloClient,
  ApolloLink,
  from,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from 'apollo-link-context';

import { getAuthToken, getEventToken } from './TokenContainer';

const httpLink = new HttpLink({ uri: 'http://localhost:3000/api/v1' });

const eventQueries = ['eventGetOne'];

export const resetContext = (client: ApolloClient<object>) => {
  client.setLink(
    from([authMiddleware(getAuthToken(), getEventToken()), httpLink]),
  );
};

const authMiddleware = (authToken, eventToken) =>
  setContext((operation) => {
    console.log(operation);
    if (!eventQueries.includes(operation.operationName) && authToken) {
      console.log('operation auth');
      return {
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      };
    }
    if (eventToken) {
      console.log('operation event');
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

const cache = new InMemoryCache({});

const useAppApolloClient = () => {
  const authToken = getAuthToken();
  const eventToken = getEventToken();
  console.log('APOLLO AUTH', authToken);
  console.log('APOLLO EVENT', eventToken);
  return new ApolloClient({
    link: from([authMiddleware(authToken, eventToken), httpLink]),
    cache,
  });
};

export default useAppApolloClient;
