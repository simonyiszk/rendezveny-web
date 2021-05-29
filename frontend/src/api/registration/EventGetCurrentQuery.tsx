import { gql } from '@urql/core';

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

export const eventIsRegisteredQuery = gql`
  query eventIsRegistered($id: String!) {
    events_getOne(id: $id) {
      id
      selfRelation2 {
        userId
        email
        registration {
          id
        }
      }
    }
  }
`;
