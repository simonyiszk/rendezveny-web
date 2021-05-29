/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

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
    }
  }
`;
