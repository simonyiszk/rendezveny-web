import { gql, OperationVariables, QueryResult, useQuery } from '@apollo/client';

import { EventRegistrationFormQuestion } from '../../interfaces';

export const formTemplatesGetQuery = gql`
  query formTemplatesGet {
    events_getRegistrationFormTemplates {
      nodes {
        id
        question
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
`;
interface QueryResultL {
  events_getRegistrationFormTemplates: {
    nodes: EventRegistrationFormQuestion[];
  };
}
export const useFormTemplatesGetQuery = (
  cb?: (data: QueryResultL) => void,
): QueryResult<QueryResultL, OperationVariables> => {
  const getQuery = useQuery<QueryResultL>(formTemplatesGetQuery, {
    onCompleted: cb,
  });
  return getQuery;
};
