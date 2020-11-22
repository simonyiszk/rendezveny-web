import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../interfaces';

export const eventGetDetailsQuery = gql`
  query e_eventGetDetails($id: String!) {
    events_getOne(id: $id) {
      id
      name
      uniqueName
      relations {
        nodes {
          userId
          name
          organizer {
            id
            isChiefOrganizer
          }
        }
      }
    }
  }
`;
interface QueryResult {
  events_getOne: Event;
}
export const useEventGetDetailsQuery = (
  cb: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(eventGetDetailsQuery, {
    onCompleted: cb,
  });
  return [getQuery, data];
};
