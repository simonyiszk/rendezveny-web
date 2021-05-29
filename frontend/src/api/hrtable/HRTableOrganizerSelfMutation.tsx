/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const hrtableRegisterMutation = gql`
  mutation e_hrtableRegisterMutation($hrSegmentId: String!, $id: String!) {
    organizer_registerToHRTask(hrSegmentId: $hrSegmentId, id: $id)
  }
`;

export const hrtableUnRegisterMutation = gql`
  mutation e_hrtableUnRegisterMutation($hrSegmentId: String!, $id: String!) {
    organizer_unregisterFromHRTask(hrSegmentId: $hrSegmentId, id: $id)
  }
`;
