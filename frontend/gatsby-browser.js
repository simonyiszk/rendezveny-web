/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { Provider } from 'urql';

import client from './src/utils/token/UrqlClient';

// eslint-disable-next-line import/prefer-default-export
export const wrapRootElement = ({ element }) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <Provider value={client}>{element}</Provider>
);
