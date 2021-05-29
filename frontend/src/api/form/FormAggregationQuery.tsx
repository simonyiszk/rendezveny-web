/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

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
