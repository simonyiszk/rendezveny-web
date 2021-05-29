/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const clubsGetOtherMembersQuery = gql`
  query clubsGetOtherMembersQuery {
    users_getSelf {
      id
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

export const clubsGetClubMembersQuery = gql`
  query clubsGetClubMembersQuery($id: String!) {
    clubs_getOne(id: $id) {
      id
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
`;
