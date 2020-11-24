import { gql, useMutation } from '@apollo/client';

import { EventRegistrationFormAnswersInput } from '../../interfaces';

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
    console.log('FILLEDFURM', filledInForm);
    return mutation({
      variables: {
        eventId,
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
