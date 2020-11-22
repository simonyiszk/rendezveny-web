import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../interfaces';

export const eventGetOrganizersQuery = gql`
  query e_eventGetOrganizers($id: String!) {
    events_getOne(id: $id) {
      name
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
export const useEventGetOrganizersQuery = (
  cb: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(eventGetOrganizersQuery, {
    onCompleted: cb,
  });
  return [getQuery, data];
};
