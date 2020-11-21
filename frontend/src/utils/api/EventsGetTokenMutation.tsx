import { gql, useMutation } from '@apollo/client';

import { setEventToken } from '../token/TokenContainer';

export const eventTokenMutationGQL = gql`
  mutation getEventToken($id: String!) {
    events_getToken(id: $id)
  }
`;

export const useEventTokenMutation = () => {
  const [mutation, mutationResults] = useMutation(eventTokenMutationGQL, {
    onCompleted: (data) => {
      setEventToken(data.events_getToken);
    },
  });

  const getEventToken = (eventId: string) => {
    console.log('getEventToken, eventid:', eventId);
    return mutation({ variables: { id: eventId } });
  };
  return [getEventToken, mutationResults];
};
