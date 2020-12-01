import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../../interfaces';

export const eventGetCurrentQuery = gql`
  query e_eventGetCurrent($id: String!) {
    events_getOne(id: $id) {
      id
      selfRelation {
        userId
        email
        registration {
          id
          formAnswer {
            answers {
              answer {
                ... on EventRegistrationFormMultipleChoiceAnswerDTO {
                  type
                  options
                }
                ... on EventRegistrationFormTextAnswerDTO {
                  type
                  text
                }
              }
              id
            }
          }
        }
      }
    }
  }
`;
interface QueryResult {
  events_getOne: Event;
}
export const useEventGetCurrentQuery = (
  cb,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(eventGetCurrentQuery, {
    onCompleted: cb,
    fetchPolicy: 'cache-and-network',
  });
  return [getQuery, data];
};
