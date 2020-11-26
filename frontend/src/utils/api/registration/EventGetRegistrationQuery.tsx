import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../../interfaces';

export const eventGetRegistrationQuery = gql`
  query e_eventGetRegistration {
    events_getCurrent {
      id
      name
      registrationForm {
        questions {
          id
          question
          isRequired
          metadata {
            ... on EventRegistrationFormMultipleChoiceQuestionDTO {
              type
              multipleAnswers
              options {
                id
                text
              }
            }
            ... on EventRegistrationFormTextQuestionDTO {
              type
              maxLength
            }
          }
        }
      }
    }
  }
`;
interface QueryResult {
  events_getCurrent: Event;
}
export const useEventGetRegistrationQuery = (
  cb: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(
    eventGetRegistrationQuery,
    {
      onCompleted: cb,
    },
  );
  return [getQuery, data];
};
