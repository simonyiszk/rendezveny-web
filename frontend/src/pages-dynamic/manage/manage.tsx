import { useApolloClient } from '@apollo/client';
import { Flex, Heading, useDisclosure } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import { useEventDeleteMutation } from '../../api/details/EventInformationMutation';
import { useEventGetInformationQuery } from '../../api/index/EventsGetInformation';
import {
  useEventTokenMutationID,
  useEventTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import Button from '../../components/control/Button';
import { Layout } from '../../components/layout/Layout';
import BinaryModal from '../../components/util/BinaryModal';
import Loading from '../../components/util/Loading';
import ManagePageButton from '../../components/util/ManagePageButton';
import { Event } from '../../interfaces';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';
import useToastService from '../../utils/services/ToastService';
import { isClubManagerOf } from '../../utils/token/TokenContainer';

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location?: PageProps<null, null, PageState>['location'];
  uniqueName?: string;
}

export default function EventPage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location?.state || (typeof history === 'object' && history.state) || {};
  const { event } = state as PageState;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [accessManagerOfHosting, setAccessManagerOfHosting] = useState(false);

  const [
    getCurrentEvent,
    {
      called: getCurrentEventCalled,
      loading: getCurrentEventLoading,
      error: getCurrentEventError,
      data: getCurrentEventData,
    },
  ] = useEventGetInformationQuery((queryData) => {
    setAccessManagerOfHosting(
      isClubManagerOf(queryData.events_getOne.hostingClubs),
    );
  });

  const client = useApolloClient();
  const [
    getEventTokenMutationID,
    { error: eventTokenMutationErrorID },
  ] = useEventTokenMutationID(client, () => {
    setAccessManagerOfHosting(isClubManagerOf(event.hostingClubs));
  });
  const [
    getEventTokenMutationUN,
    { error: eventTokenMutationErrorUN },
  ] = useEventTokenMutationUN(client, () => {
    getCurrentEvent({ variables: { uniqueName } });
  });

  const makeToast = useToastService();

  const [getEventDeleteMutation] = useEventDeleteMutation({
    onCompleted: () => {
      makeToast('Sikeres törlés');
      navigate('/');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });

  useEffect(() => {
    if (event) getEventTokenMutationID(event.id);
    else if (uniqueName) getEventTokenMutationUN(uniqueName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (getCurrentEventCalled && getCurrentEventLoading) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenMutationErrorID ||
    eventTokenMutationErrorUN ||
    getCurrentEventError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <div>Error</div>;
  }

  const handleDelete = (): void => {
    getEventDeleteMutation(event?.id ?? getCurrentEventData?.events_getOne.id);
    onClose();
  };

  return (
    <Layout>
      <Heading textAlign="center" mb="2rem">
        {event?.name ?? getCurrentEventData?.events_getOne.name} kezelése
      </Heading>
      <Flex flexDir="column" alignItems="center">
        <ManagePageButton
          accessText={['organizer']}
          text="Résztvevők kezelése"
          toPostfix="members"
          event={event ?? getCurrentEventData?.events_getOne}
        />
        <ManagePageButton
          access={accessManagerOfHosting}
          accessText={['admin', 'chief']}
          text="Rendezvény kezelése"
          toPostfix="details"
          event={event ?? getCurrentEventData?.events_getOne}
        />
        <ManagePageButton
          accessText={['organizer']}
          text="HR tábla"
          toPostfix="hrtable"
          event={event ?? getCurrentEventData?.events_getOne}
        />
        <ManagePageButton
          accessText={['organizer']}
          text="Regisztrációs form"
          toPostfix="formeditor"
          event={event ?? getCurrentEventData?.events_getOne}
        />
        <ProtectedComponent
          access={accessManagerOfHosting}
          accessText={['admin', 'chief']}
        >
          <Button
            text="Esemény törlése"
            width={['100%', null, '30rem']}
            mb="1rem"
            backgroundColor="red.500"
            onClick={onOpen}
          />
        </ProtectedComponent>
      </Flex>

      <BinaryModal
        isOpen={isOpen}
        onClose={onClose}
        title="Biztosan törlöd az eseményt?"
        onAccept={handleDelete}
        onReject={onClose}
      />
    </Layout>
  );
}
EventPage.defaultProps = {
  location: undefined,
  uniqueName: undefined,
};
