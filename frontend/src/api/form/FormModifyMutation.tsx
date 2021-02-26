import { FetchResult, gql, MutationResult, useMutation } from '@apollo/client';

import { EventRegistrationFormInput, MutationProps } from '../../interfaces';

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

export const useModifyFormMutation = ({
  onCompleted,
  onError,
  refetchQueries,
}: MutationProps): [
  (id: string, form: EventRegistrationFormInput) => Promise<FetchResult>,
  MutationResult,
] => {
  const [mutation, mutationResults] = useMutation(modifyFormMutation, {
    onCompleted,
    onError,
    refetchQueries,
  });

  const getMutation = (
    id: string,
    form: EventRegistrationFormInput,
  ): Promise<FetchResult> => {
    return mutation({
      variables: {
        id,
        form,
      },
    });
  };
  return [getMutation, mutationResults];
};
