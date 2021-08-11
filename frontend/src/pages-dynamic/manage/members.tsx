import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'urql';

import { formAggregationQuery } from '../../api/form/FormAggregationQuery';
import { eventGetInformationQuery } from '../../api/index/EventsGetInformation';
import { eventGetMembersQuery } from '../../api/registration/EventMembersQuery';
import { setAttendMutation } from '../../api/registration/RegistrationMutation';
import {
  eventsGetTokenMutationID,
  eventsGetTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import Backtext from '../../components/control/Backtext';
import { Layout } from '../../components/layout/Layout';
import LoginComponent from '../../components/login/LoginComponent';
import FormAggregation from '../../components/sections/FormAggregation';
import MemberSection from '../../components/sections/MemberSection';
import Loading from '../../components/util/Loading';
import { Event, EventGetOneResult, EventRelation } from '../../interfaces';
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

export default function MembersPage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location?.state || (typeof history === 'object' && history.state) || {};
  const { event } = state as PageState;

  const roleContext = useContext(RoleContext);

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
  const eventData = event ?? getCurrentEventData?.events_getOne;

  const [
    {
      data: getAggregationData,
      fetching: getAggregationFetch,
      error: getAggregationError,
    },
  ] = useQuery<EventGetOneResult>({
    query: formAggregationQuery,
    variables: { id: eventData?.id },
    requestPolicy: 'cache-and-network',
    pause: eventData === undefined,
  });
  const [
    { data: getRegsData, fetching: getRegsFetch, error: getRegsError },
  ] = useQuery<EventGetOneResult>({
    query: eventGetMembersQuery,
    variables: { id: eventData?.id },
    requestPolicy: 'cache-and-network',
    pause: eventData === undefined,
  });

  const [registeredUsers, setRegisteredUsers] = useState<EventRelation[]>(
    getRegsData?.events_getOne?.relations.nodes ?? [],
  );
  useEffect(() => {
    if (getRegsData)
      setRegisteredUsers(getRegsData?.events_getOne?.relations.nodes);
  }, [getRegsData]);

  const makeToast = useToastService();

  const [, getSetAttendMutation] = useMutation(setAttendMutation);

  useEffect(() => {
    if (event)
      getEventTokenMutationID({ id: event.id }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
        }
      });
    else if (uniqueName)
      getEventTokenMutationUN({ uniqueName }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    eventTokenIDFetch ||
    eventTokenUNFetch ||
    getCurrentEventFetch ||
    (!event && !getCurrentEventData) ||
    getAggregationFetch ||
    getRegsFetch
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenIDError ||
    eventTokenUNError ||
    getCurrentEventError ||
    getAggregationError ||
    getRegsError
  ) {
    if (
      [
        eventTokenIDError,
        eventTokenUNError,
        getCurrentEventError,
        getAggregationError,
        getRegsError,
      ].some(
        (e) => e?.message === '[GraphQL] Unauthorized to perform operation',
      )
    ) {
      if (!roleContext.isLoggedIn) return <LoginComponent />;
      navigate('/');
    }
    return <div />;
  }

  const handleSetAttend = (user: EventRelation): void => {
    getSetAttendMutation({
      id: user.registration.id,
      attended: !user.registration.didAttend,
    }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        makeToast(
          `Sikeres ${!user.registration.didAttend ? 'belépés' : 'kilépés'}`,
        );
        setRegisteredUsers(
          registeredUsers.map((u) => {
            if (u.userId !== user.userId) return u;
            const newUser = {
              ...u,
              registration: {
                ...u.registration,
                didAttend: !u.registration.didAttend,
              },
            };
            return newUser;
          }),
        );
      }
    });
  };

  return (
    <Layout>
      <Backtext
        text="Vissza a rendezvény kezeléséhez"
        to={`/manage/${event?.uniqueName}`}
        state={{ event }}
      />
      <Tabs isFitted variant="enclosed" width="100%">
        <TabList mb="1em">
          <Tab>Résztvevők</Tab>
          <Tab>Eredmények</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MemberSection
              listOfMembers={registeredUsers}
              eventL={
                {
                  ...(event ?? getCurrentEventData?.events_getOne),
                  registrationForm: getRegsData?.events_getOne.registrationForm,
                } as Event
              }
              setAttendCb={handleSetAttend}
            />
          </TabPanel>
          <TabPanel>
            <FormAggregation
              questions={
                getAggregationData?.events_getOne.registrationForm.questions ??
                []
              }
              answers={
                getAggregationData?.events_getOne.registrationFormAnswers
                  .answers ?? []
              }
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
}
MembersPage.defaultProps = {
  location: undefined,
  uniqueName: undefined,
};
