import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../interfaces';

export const eventGetOneQuery = gql`
  query eventGetOne($id: String!) {
    events_getOne(id: $id) {
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
export const useEventGetOneQuery = (
  cb: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getEvent, data] = useLazyQuery<QueryResult>(eventGetOneQuery, {
    onCompleted: cb,
  });
  return [getEvent, data];
};
