import { useApolloClient } from '@apollo/client';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import { useFormAggregationQuery } from '../../api/form/FormAggregationQuery';
import { useEventGetInformationQuery } from '../../api/index/EventsGetInformation';
import { useEventGetMembersQuery } from '../../api/registration/EventMembersQuery';
import { useSetAttendMutation } from '../../api/registration/RegistrationMutation';
import {
  useEventTokenMutationID,
  useEventTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import { Layout } from '../../components/layout/Layout';
import FormAggregation from '../../components/sections/FormAggregation';
import MemberSection from '../../components/sections/MemberSection';
import Loading from '../../components/util/Loading';
import { Event, EventRelation } from '../../interfaces';
import useToastService from '../../utils/services/ToastService';

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

  const [registeredUsers, setRegisteredUsers] = useState<EventRelation[]>([]);

  const [
    getFormAggregations,
    {
      called: getAggregationCalled,
      loading: getAggregationLoading,
      error: getAggregationError,
      data: getAggregationData,
    },
  ] = useFormAggregationQuery();

  const [
    getEventRegs,
    {
      called: getEventCalled,
      loading: getEventLoading,
      error: getEventError,
      data: getEventData,
    },
  ] = useEventGetMembersQuery((queryData) => {
    setRegisteredUsers(queryData.events_getOne.relations.nodes);
  });

  const [
    getCurrentEvent,
    {
      called: getCurrentEventCalled,
      loading: getCurrentEventLoading,
      error: getCurrentEventError,
      data: getCurrentEventData,
    },
  ] = useEventGetInformationQuery((queryData) => {
    getEventRegs({ variables: { id: queryData.events_getOne.id } });
    getFormAggregations({ variables: { id: queryData.events_getOne.id } });
  });

  const client = useApolloClient();
  const [
    getEventTokenMutationID,
    { error: eventTokenMutationErrorID },
  ] = useEventTokenMutationID(client, () => {
    getEventRegs({ variables: { id: event.id } });
    getFormAggregations({ variables: { id: event.id } });
  });
  const [
    getEventTokenMutationUN,
    { error: eventTokenMutationErrorUN },
  ] = useEventTokenMutationUN(client, () => {
    getCurrentEvent({ variables: { uniqueName } });
  });

  const makeToast = useToastService();

  const [getSetAttendMutation] = useSetAttendMutation({
    onCompleted: () => {
      makeToast('Sikeres belépés');
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

  if (
    (getCurrentEventCalled && getCurrentEventLoading) ||
    (getEventCalled && getEventLoading) ||
    (getAggregationCalled && getAggregationLoading)
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenMutationErrorID ||
    eventTokenMutationErrorUN ||
    getCurrentEventError ||
    getEventError ||
    getAggregationError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <div>Error</div>;
  }

  const handleSetAttend = (user: EventRelation): void => {
    getSetAttendMutation(user.registration.id, !user.registration.didAttend);
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
  };

  return (
    <Layout>
      <Tabs isFitted variant="enclosed" width="100%">
        <TabList mb="1em">
          <Tab>Résztvevők</Tab>
          <Tab>Eredmények</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MemberSection
              text="Résztvevők"
              listOfMembers={registeredUsers}
              eventL={
                {
                  ...(event ?? getCurrentEventData?.events_getOne),
                  registrationForm:
                    getEventData?.events_getOne.registrationForm,
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
