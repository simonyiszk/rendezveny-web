import {
  ApolloClient,
  FetchResult,
  gql,
  MutationResult,
  useMutation,
} from '@apollo/client';

import { EventRelation } from '../../interfaces';
import { resetContext } from '../../utils/token/ApolloClient';
import { setEventRole, setEventToken } from '../../utils/token/TokenContainer';

export const eventsGetTokenMutationID = gql`
  mutation getEventToken($id: String) {
    events_getToken(id: $id) {
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
export const useEventTokenMutationID = (
  client: ApolloClient<object>,
  cb?: (data: QueryResult) => void,
): [(id: string) => Promise<FetchResult>, MutationResult] => {
  const [mutation, mutationResults] = useMutation(eventsGetTokenMutationID, {
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

  const getEventToken = (id: string): Promise<FetchResult> => {
    return mutation({ variables: { id } });
  };
  return [getEventToken, mutationResults];
};

export const eventsGetTokenMutationUN = gql`
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

export const useEventTokenMutationUN = (
  client: ApolloClient<object>,
  cb?: (data: QueryResult) => void,
): [(uniqueName: string) => Promise<FetchResult>, MutationResult] => {
  const [mutation, mutationResults] = useMutation(eventsGetTokenMutationUN, {
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
