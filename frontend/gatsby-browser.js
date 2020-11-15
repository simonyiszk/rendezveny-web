import { ApolloProvider } from '@apollo/client';
import React from 'react';

import useAppApolloClient from './src/utils/ApolloClient';

// eslint-disable-next-line import/prefer-default-export
export const wrapRootElement = ({ element }) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <ApolloProvider client={useAppApolloClient()}>{element}</ApolloProvider>
);
