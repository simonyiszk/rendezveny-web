import { gql, useMutation } from '@apollo/client';

import { setToken } from './TokenContainer';

export const loginMutationGQL = gql`
  mutation {
    login_withLocalIdentity(username: "admin", password: "admin") {
      access
      refresh
    }
  }
`;

export const useLoginMutation = () => {
  const [mutation, mutationResults] = useMutation(loginMutationGQL, {
    onCompleted: (data) => {
      setToken(data.login_withLocalIdentity.access);
    },
  });

  const login = (user: string, password: string) => {
    return mutation({
      variables: {
        login: user,
        password,
      },
    });
  };
  return [login, mutationResults];
};
