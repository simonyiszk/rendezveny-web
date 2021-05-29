/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

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
