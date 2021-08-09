/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const eventGetInformationQuery = gql`
  query e_eventGetInformation($uniqueName: String!) {
    events_getOne(uniqueName: $uniqueName) {
      id
      name
      description
      place
      start
      end
      registrationStart
      registrationEnd
      uniqueName
      capacity
      alreadyRegistered
      registrationAllowed
      hostingClubs {
        id
        name
      }
    }
  }
`;
