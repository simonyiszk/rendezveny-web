/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const modifyFormMutation = gql`
  mutation e_modifyFormMutation(
    $id: String!
    $form: EventRegistrationFormInput!
  ) {
    events_modifyRegistrationForm(id: $id, form: $form) {
      questions {
        id
        isRequired
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
