import { Flex, Heading, useDisclosure } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useContext, useEffect } from 'react';
import { useMutation, useQuery } from 'urql';

import { eventDeleteMutation } from '../../api/details/EventInformationMutation';
import { eventGetInformationQuery } from '../../api/index/EventsGetInformation';
import {
  eventsGetTokenMutationID,
  eventsGetTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import Button from '../../components/control/Button';
import { Layout } from '../../components/layout/Layout';
import BinaryModal from '../../components/util/BinaryModal';
import Loading from '../../components/util/Loading';
import ManagePageButton from '../../components/util/ManagePageButton';
import { Event, EventGetOneResult } from '../../interfaces';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';
import { RoleContext } from '../../utils/services/RoleContext';
import useToastService from '../../utils/services/ToastService';
import { setEventToken } from '../../utils/token/TokenContainer';

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

  const roleContext = useContext(RoleContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [
    { fetching: eventTokenIDFetch, error: eventTokenIDError },
    getEventTokenMutationID,
  ] = useMutation(eventsGetTokenMutationID);
  const [
    {
      data: eventTokenUNData,
      fetching: eventTokenUNFetch,
      error: eventTokenUNError,
    },
    getEventTokenMutationUN,
  ] = useMutation(eventsGetTokenMutationUN);

  const [
    {
      data: getCurrentEventData,
      fetching: getCurrentEventFetch,
      error: getCurrentEventError,
    },
  ] = useQuery<EventGetOneResult>({
    query: eventGetInformationQuery,
    variables: { uniqueName },
    pause: eventTokenUNData === undefined,
  });
  // const eventData = event ?? getCurrentEventData?.events_getOne;

  const makeToast = useToastService();

  const [, getEventDeleteMutation] = useMutation(eventDeleteMutation);

  useEffect(() => {
    if (event)
      getEventTokenMutationID({ id: event.id }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
          console.log('res.data', res.data);
        }
      });
    else if (uniqueName)
      getEventTokenMutationUN({ uniqueName }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
          console.log('res.data', res.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    eventTokenIDFetch ||
    eventTokenUNFetch ||
    getCurrentEventFetch ||
    (!event && !getCurrentEventData)
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenIDError ||
    eventTokenUNError ||
    getCurrentEventError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <div>Error</div>;
  }

  const handleDelete = (): void => {
    getEventDeleteMutation({
      id: event?.id ?? getCurrentEventData?.events_getOne.id,
    }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        makeToast('Sikeres törlés');
        navigate('/');
        onClose();
      }
    });
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
          accessText={['admin', 'chief', 'managerofhost']}
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
        <ProtectedComponent accessText={['admin', 'chief', 'managerofhost']}>
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
