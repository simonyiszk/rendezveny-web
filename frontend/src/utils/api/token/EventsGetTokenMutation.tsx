import { ApolloClient, gql, useMutation } from '@apollo/client';

import { resetContext } from '../../token/ApolloClient';
import { setEventRole, setEventToken } from '../../token/TokenContainer';

export const eventsGetTokenMutation = gql`
  mutation getEventToken($id: String!) {
    events_getToken(id: $id) {
      eventToken
      relation {
        isChiefOrganizer
        isOrganizer
      }
    }
  }
`;

export const useEventTokenMutation = (client: ApolloClient<object>) => {
  const [mutation, mutationResults] = useMutation(eventsGetTokenMutation, {
    onCompleted: (data) => {
      setEventToken(data.events_getToken.eventToken);
      setEventRole(
        data.events_getToken.relation.isChiefOrganizer,
        data.events_getToken.relation.isOrganizer,
      );
      resetContext(client);
    },
  });

  const getEventToken = (eventId: string) => {
    return mutation({ variables: { id: eventId } });
  };
  return [getEventToken, mutationResults];
};
