import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../interfaces';

export const eventGetMembersQuery = gql`
  query e_eventGetMembers($id: String!) {
    events_getOne(id: $id) {
      id
      name
      uniqueName
      registrationAllowed
      relations(registered: true) {
        nodes {
          userId
          name
          registration {
            id
            didAttend
          }
        }
      }
    }
  }
`;
interface QueryResult {
  events_getOne: Event;
}
export const useEventGetMembersQuery = (
  cb: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(eventGetMembersQuery, {
    onCompleted: cb,
  });
  return [getQuery, data];
};
