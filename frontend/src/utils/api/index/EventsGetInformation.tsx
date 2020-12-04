import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../../interfaces';

export const eventGetInformationQuery = gql`
  query e_eventGetInformation($uniqueName: String!) {
    events_getOne(uniqueName: $uniqueName) {
      id
      name
      description
      place
      start
      end
      registrationStart
      registrationEnd
      uniqueName
      capacity
    }
  }
`;
interface QueryResult {
  events_getOne: Event;
}
export const useEventGetInformationQuery = (
  cb?: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(eventGetInformationQuery, {
    onCompleted: cb,
  });
  return [getQuery, data];
};
