import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../../interfaces';

export const eventGetOrganizersQuery = gql`
  query e_eventGetOrganizers($id: String!) {
    events_getOne(id: $id) {
      id
      name
      description
      uniqueName
      start
      end
      registrationStart
      registrationEnd
      place
      isClosedEvent
      capacity
      registrationAllowed
      hostingClubs {
        id
        name
      }
      organizers: relations(chiefOrganizer: false) {
        nodes {
          userId
          name
        }
      }
      chiefOrganizers: relations(chiefOrganizer: true) {
        nodes {
          userId
          name
        }
      }
      relations {
        nodes {
          userId
          name
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
