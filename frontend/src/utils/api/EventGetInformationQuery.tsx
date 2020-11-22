import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../interfaces';

export const eventGetInformationQuery = gql`
  query e_eventGetInformation($id: String!) {
    events_getOne(id: $id) {
      id
      name
      uniqueName
      start
      end
      registrationStart
      registrationEnd
      place
      isClosedEvent
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
export const useEventGetInformationQuery = (
  cb: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(eventGetInformationQuery, {
    onCompleted: cb,
  });
  return [getQuery, data];
};
