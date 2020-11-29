import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event, EventRegistration } from '../../../interfaces';

export const eventGetMembersQuery = gql`
  query e_eventGetMembers($id: String!) {
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
      relations(registered: true) {
        nodes {
          userId
          name
          registration {
            id
            didAttend
            registrationDate
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
    fetchPolicy: 'network-only',
  });
  return [getQuery, data];
};

export const registrationGetOneQuery = gql`
  query e_registrationGetOne($id: String!) {
    registration_getOne(id: $id) {
      id
      didAttend
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
`;
interface QueryResult {
  registration_getOne: EventRegistration;
}
export const useRegistrationGetOneQuery = (
  cb: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(registrationGetOneQuery, {
    onCompleted: cb,
    fetchPolicy: 'network-only',
  });
  return [getQuery, data];
};
