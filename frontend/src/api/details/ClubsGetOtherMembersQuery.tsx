import { gql, OperationVariables, QueryResult, useQuery } from '@apollo/client';

import { Membership } from '../../interfaces';

export const clubsGetOtherMembersQuery = gql`
  query clubsGetOtherMembersQuery {
    users_getSelf {
      clubMemberships(isManaged: true) {
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
interface QueryResultL {
  users_getSelf: {
    clubMemberships: {
      nodes: Membership[];
    };
  };
}
export const useClubsGetOtherMembersQuery = (
  cb: (data: QueryResultL) => void,
): QueryResult<QueryResultL, OperationVariables> => {
  const getQuery = useQuery<QueryResultL>(clubsGetOtherMembersQuery, {
    onCompleted: cb,
  });
  return getQuery;
};
