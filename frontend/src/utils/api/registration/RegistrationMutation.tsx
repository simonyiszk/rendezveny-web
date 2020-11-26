import { gql, useMutation } from '@apollo/client';

import { EventRegistrationFormAnswersInput } from '../../../interfaces';

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

export const useRegisterSelfMutation = () => {
  const [mutation, mutationResults] = useMutation(registerSelfMutation);

  const getMutation = (
    eventId: string,
    filledInForm: EventRegistrationFormAnswersInput,
  ) => {
    return mutation({
      variables: {
        eventId,
        filledInForm,
      },
    });
  };
  return [getMutation, mutationResults];
};

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

export const useModifyFilledInForm = () => {
  const [mutation, mutationResults] = useMutation(modifyFilledInForm);

  const getMutation = (
    id: string,
    filledInForm: EventRegistrationFormAnswersInput,
  ) => {
    return mutation({
      variables: {
        id,
        filledInForm,
      },
    });
  };
  return [getMutation, mutationResults];
};

export const registerDeleteMutation = gql`
  mutation e_registerDeleteMutation($id: String!) {
    registration_deleteOne(id: $id)
  }
`;

export const useRegisterDeleteMutation = () => {
  const [mutation, mutationResults] = useMutation(registerDeleteMutation);

  const getMutation = (id: string) => {
    return mutation({
      variables: {
        id,
      },
    });
  };
  return [getMutation, mutationResults];
};

export const setAttendMutation = gql`
  mutation e_setAttendMutation($id: String!, $attended: Boolean!) {
    registration_setAttendState(id: $id, attended: $attended)
  }
`;

export const useSetAttendMutation = () => {
  const [mutation, mutationResults] = useMutation(setAttendMutation);

  const getMutation = (id: string, attended: boolen) => {
    return mutation({
      variables: {
        id,
        attended,
      },
    });
  };
  return [getMutation, mutationResults];
};
