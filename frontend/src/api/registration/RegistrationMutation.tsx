/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const registerSelfMutation = gql`
  mutation registerSelfMutation(
    $eventId: String!
    $filledInForm: EventRegistrationFormAnswersInput!
  ) {
    registration_registerSelf(eventId: $eventId, filledInForm: $filledInForm) {
      id
    }
  }
`;

export const modifyFilledInForm = gql`
  mutation e_modifyFilledInForm(
    $id: String!
    $filledInForm: EventRegistrationFormAnswersInput!
  ) {
    registration_modifyFilledInForm(id: $id, filledInForm: $filledInForm) {
      answers {
        id
      }
    }
  }
`;

export const registerDeleteMutation = gql`
  mutation e_registerDeleteMutation($id: String!) {
    registration_deleteOne(id: $id)
  }
`;

export const setAttendMutation = gql`
  mutation e_setAttendMutation($id: String!, $attended: Boolean!) {
    registration_setAttendState(id: $id, attended: $attended)
  }
`;
