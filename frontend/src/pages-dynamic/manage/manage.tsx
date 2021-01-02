import { useApolloClient } from '@apollo/client';
import {
  Flex,
  Heading,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
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
import LinkButton from '../../components/control/LinkButton';
import { Layout } from '../../components/layout/Layout';
import Loading from '../../components/util/Loading';
import { Event } from '../../interfaces';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';
import {
  isAdmin,
  isChiefOrganizer,
  isClubManagerOf,
  isOrganizer,
} from '../../utils/token/TokenContainer';

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location: PageProps<null, null, PageState>['location'];
  uniqueName: string;
}

export default function EventPage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state) || {};
  const { event } = state;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [accessOrg, setAccessOrg] = useState(false);
  const [accessChiefCMAdmin, setAccessChiefCMAdmin] = useState(false);

  const [
    getCurrentEvent,
    {
      called: getCurrentEventCalled,
      loading: getCurrentEventLoading,
      error: getCurrentEventError,
      data: getCurrentEventData,
    },
  ] = useEventGetInformationQuery((queryData) => {
    setAccessOrg(isOrganizer());
    setAccessChiefCMAdmin(
      isChiefOrganizer() ||
        isClubManagerOf(queryData.events_getOne.hostingClubs) ||
        isAdmin(),
    );
  });

  const client = useApolloClient();
  const [
    getEventTokenMutationID,
    { error: eventTokenMutationErrorID },
  ] = useEventTokenMutationID(client, () => {
    setAccessOrg(isOrganizer());
    setAccessChiefCMAdmin(
      isChiefOrganizer() || isClubManagerOf(event.hostingClubs) || isAdmin(),
    );
  });
  const [
    getEventTokenMutationUN,
    { error: eventTokenMutationErrorUN },
  ] = useEventTokenMutationUN(client, () => {
    getCurrentEvent({ variables: { uniqueName } });
  });

  const toast = useToast();
  const makeToast = (
    title: string,
    isError = false,
    description = '',
  ): void => {
    toast({
      title,
      description,
      status: isError ? 'error' : 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  const [getEventDeleteMutation] = useEventDeleteMutation({
    onCompleted: () => {
      makeToast('Sikeres törlés');
      navigate('/manage');
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
      navigate('/manage');
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
        <ProtectedComponent access={accessOrg}>
          <LinkButton
            text="Résztvevők kezelése"
            width={['100%', null, '30rem']}
            mb="1rem"
            to={`/manage/${
              event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
            }/members`}
            state={{ event: event ?? getCurrentEventData?.events_getOne }}
          />
        </ProtectedComponent>
        <ProtectedComponent access={accessChiefCMAdmin}>
          <LinkButton
            text="Rendezvény kezelése"
            width={['100%', null, '30rem']}
            mb="1rem"
            to={`/manage/${
              event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
            }/details`}
            state={{ event: event ?? getCurrentEventData?.events_getOne }}
          />
        </ProtectedComponent>
        <ProtectedComponent access={accessOrg}>
          <LinkButton
            text="HR tábla"
            width={['100%', null, '30rem']}
            mb="1rem"
            to={`/manage/${
              event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
            }/hrtable`}
            state={{ event: event ?? getCurrentEventData?.events_getOne }}
          />
        </ProtectedComponent>
        <ProtectedComponent access={accessOrg}>
          <LinkButton
            text="Regisztrációs form"
            width={['100%', null, '30rem']}
            mb="1rem"
            to={`/manage/${
              event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
            }/formeditor`}
            state={{ event: event ?? getCurrentEventData?.events_getOne }}
          />
        </ProtectedComponent>
        <ProtectedComponent access={accessChiefCMAdmin}>
          <Button
            text="Esemény törlése"
            width={['100%', null, '30rem']}
            mb="1rem"
            backgroundColor="red.500"
            onClick={onOpen}
          />
        </ProtectedComponent>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Biztosan törlöd az eseményt?</ModalHeader>
          <ModalCloseButton />
          <ModalFooter>
            <Flex width="100%" flexDirection="column">
              <Flex
                justifyContent={['center', null, 'space-between']}
                flexDir={['column', null, 'row']}
                width="100%"
              >
                <Button
                  width={['100%', null, '45%']}
                  text="Igen"
                  onClick={handleDelete}
                />
                <Button
                  width={['100%', null, '45%']}
                  text="Nem"
                  backgroundColor="red.500"
                  mt={[4, null, 0]}
                  onClick={onClose}
                />
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
