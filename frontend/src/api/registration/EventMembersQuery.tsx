import { gql } from '@urql/core';

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
