import {
  ApolloClient,
  FetchResult,
  gql,
  MutationResult,
  useMutation,
} from '@apollo/client';

import { EventRelation } from '../../../interfaces';
import { resetContext } from '../../token/ApolloClient';
import { setEventRole, setEventToken } from '../../token/TokenContainer';

export const eventsGetTokenMutation = gql`
  mutation getEventToken($uniqueName: String) {
    events_getToken(uniqueName: $uniqueName) {
      eventToken
      id
      relation {
        isChiefOrganizer
        isOrganizer
      }
    }
  }
`;

interface QueryResult {
  events_getToken: {
    eventToken: string;
    id: string;
    relation: EventRelation;
  };
}
export const useEventTokenMutation = (
  client: ApolloClient<object>,
  cb?: (data: QueryResult) => void,
): [(uniqueName: string) => Promise<FetchResult>, MutationResult] => {
  const [mutation, mutationResults] = useMutation(eventsGetTokenMutation, {
    onCompleted: (data) => {
      setEventToken(data.events_getToken.eventToken);
      setEventRole(
        data.events_getToken.relation.isChiefOrganizer,
        data.events_getToken.relation.isOrganizer,
      );
      resetContext(client);
      if (cb) {
        cb(data);
      }
    },
  });

  const getEventToken = (uniqueName: string): Promise<FetchResult> => {
    return mutation({ variables: { uniqueName } });
  };
  return [getEventToken, mutationResults];
};
