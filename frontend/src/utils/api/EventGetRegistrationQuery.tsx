import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../interfaces';

export const eventGetRegistrationQuery = gql`
  query e_eventGetRegistration($id: String!) {
    events_getOne(id: $id) {
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
      selfRelation {
        email
        registration {
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
