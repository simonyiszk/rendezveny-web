import { ApolloClient, gql, useMutation } from '@apollo/client';

import { resetContext } from '../../token/ApolloClient';
import { setEventToken } from '../../token/TokenContainer';

export const eventsGetTokenMutation = gql`
  mutation getEventToken($id: String!) {
    events_getToken(id: $id)
  }
`;

export const useEventTokenMutation = (client: ApolloClient<object>) => {
  const [mutation, mutationResults] = useMutation(eventsGetTokenMutation, {
    onCompleted: (data) => {
      setEventToken(data.events_getToken);
      resetContext(client);
    },
  });

  const getEventToken = (eventId: string) => {
    return mutation({ variables: { id: eventId } });
  };
  return [getEventToken, mutationResults];
};
