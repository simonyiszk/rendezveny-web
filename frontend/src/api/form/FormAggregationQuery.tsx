import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../interfaces';

export const formAggregationQuery = gql`
  query e_formAggregation($id: String!) {
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
      registrationFormAnswers {
        answers {
          formQuestionId
          registrationId
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
        }
      }
    }
  }
`;
interface QueryResult {
  events_getOne: Event;
}
export const useFormAggregationQuery = (
  cb?: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(formAggregationQuery, {
    onCompleted: cb,
    fetchPolicy: 'cache-and-network',
  });
  return [getQuery, data];
};
