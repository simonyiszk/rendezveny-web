import { gql, useMutation } from '@apollo/client';

import { resetContext } from '../../token/ApolloClient';
import { setAuthToken, setRoleAndClubs } from '../../token/TokenContainer';

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

export const useLoginMutation = (client: ApolloClient<object>) => {
  const [mutation, mutationResults] = useMutation(
    loginWithLocalIdentityMutation,
    {
      onCompleted: (data) => {
        setAuthToken(data.login_withLocalIdentity.access);
        setRoleAndClubs(
          data.login_withLocalIdentity.role,
          data.login_withLocalIdentity.memberships.map((m) => m.role),
        );
        resetContext(client);
      },
    },
  );

  const login = (user: string, password: string) => {
    return mutation({
      variables: {
        username: user,
        password,
      },
    });
  };
  return [login, mutationResults];
};
