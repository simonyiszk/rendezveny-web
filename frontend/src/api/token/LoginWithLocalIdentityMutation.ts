import {
  ApolloClient,
  FetchResult,
  gql,
  MutationResult,
  useMutation,
} from '@apollo/client';

import { MutationProps } from '../../interfaces';
import { resetContext } from '../../utils/token/ApolloClient';
import {
  setAuthToken,
  setRoleAndClubs,
} from '../../utils/token/TokenContainer';

export const loginWithLocalIdentityMutation = gql`
  mutation loginMutation($username: String!, $password: String!) {
    login_withLocalIdentity(username: $username, password: $password) {
      access
      refresh
      role
      memberships {
        club {
          id
          name
        }
        role
      }
    }
  }
`;

export const useLoginMutation = (
  client: ApolloClient<object>,
  { onCompleted, onError, refetchQueries }: MutationProps,
): [
  (user: string, password: string) => Promise<FetchResult>,
  MutationResult,
] => {
  const [mutation, mutationResults] = useMutation(
    loginWithLocalIdentityMutation,
    {
      onCompleted: (data) => {
        setAuthToken(data.login_withLocalIdentity.access);
        setRoleAndClubs(
          data.login_withLocalIdentity.role,
          data.login_withLocalIdentity.memberships,
        );
        resetContext(client);
        if (onCompleted) {
          onCompleted();
        }
      },
      onError,
      refetchQueries,
    },
  );

  const login = (user: string, password: string): Promise<FetchResult> => {
    return mutation({
      variables: {
        username: user,
        password,
      },
    });
  };
  return [login, mutationResults];
};