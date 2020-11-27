import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Membership } from '../../../interfaces';

export const clubsGetOtherMembersQuery = gql`
  query clubsGetOtherMembersQuery {
    users_getSelf {
      clubMemberships {
        nodes {
          club {
            id
            name
            clubMemberships {
              nodes {
                user {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;
interface QueryResult {
  users_getSelf: {
    clubMemberships: {
      nodes: Membership[];
    };
  };
}
export const useClubsGetOtherMembersQuery = (
  cb: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(
    clubsGetOtherMembersQuery,
    {
      onCompleted: cb,
    },
  );
  return [getQuery, data];
};
