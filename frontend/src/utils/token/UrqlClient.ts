import { createClient } from 'urql';

import { getAuthToken, getEventToken } from './TokenContainer';

export default createClient({
  url: process.env.GATSBY_SERVER_API_URL!,
  fetchOptions: () => {
    const token = getAuthToken();
    return {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    };
  },
});
