import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../../interfaces';

export const eventGetUniquenamesQuery = gql`
  query eventsGetUniquenames {
    events_getAll {
      nodes {
        id
        uniqueName
      }
    }
  }
`;
interface QueryResult {
  events_getAll: {
    nodes: Event[];
  };
}
export const useEventGetUniquenamesQuery = (
  cb?: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(eventGetUniquenamesQuery, {
    onCompleted: cb,
  });
  return [getQuery, data];
};
