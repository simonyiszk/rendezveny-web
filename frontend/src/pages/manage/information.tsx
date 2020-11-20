import 'react-datepicker/dist/react-datepicker.css';

import { gql, useQuery } from '@apollo/client';
import { Box, Flex, Input, Select } from '@chakra-ui/core';
import hu from 'date-fns/locale/hu';
import { navigate, PageProps } from 'gatsby';
import { Multiselect } from 'multiselect-react-dropdown';
import React, { useEffect, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

import Button from '../../components/Button';
import EventSection from '../../components/EventSection';
import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import { Event, User } from '../../interfaces';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';

registerLocale('hu', hu);

interface PageState {
  event: Event;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

export default function InformationPage({
  location: {
    state: { event },
  },
}: Props): JSX.Element {
  const orgUsers = [
    { id: 1, name: 'April' },
    { id: 2, name: 'May' },
  ] as User[];
  const allUsers = ([
    { id: 3, name: 'June' },
    { id: 4, name: 'July' },
    { id: 5, name: 'August' },
  ] as User[]).concat(orgUsers);

  const [eventName, setEventName] = useState(event?.name || '');
  const [eventStart, setEventStart] = useState(
    event?.start ? new Date(event.start) : new Date(),
  );
  const [eventEnd, setEventEnd] = useState(
    event?.end ? new Date(event.end) : new Date(),
  );
  const [eventPlace, setEventPlace] = useState(event?.place || '');
  const [eventOrganizers, setEventOrganizers] = useState<User[]>(orgUsers);
  // const [eventLimit, setEventLimit] = useState(event?.limit || 0);
  const [eventClosed, setEventClosed] = useState(event?.isClosedEvent || false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'Submitted',
      eventName,
      eventStart,
      eventEnd,
      eventPlace,
      eventOrganizers,
      eventClosed,
    );
    if (event) {
      navigate('/manage', { state: { event } });
    } else {
      navigate('/');
    }
  };
  const onChangeOrganizers = (
    selectedList: User[],
    _selectedItem: User,
  ): void => {
    setEventOrganizers(selectedList);
  };
  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <form onSubmit={handleSubmit}>
          <Box>
            <Box>Esemény neve</Box>
            <Input
              name="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </Box>
          <Box>
            <Box>Esemény kezdete</Box>
            <DatePicker
              name="eventStart"
              selected={eventStart}
              onChange={(date) => setEventStart(date)}
              dateFormat="yyyy.MM.dd. HH:mm"
              locale="hu"
              showTimeSelect
            />
          </Box>
          <Box>
            <Box>Esemény vége</Box>
            <DatePicker
              name="eventEnd"
              selected={eventEnd}
              onChange={(date) => setEventEnd(date)}
              dateFormat="yyyy.MM.dd. HH:mm"
              locale="hu"
              showTimeSelect
            />
          </Box>
          <Box>
            <Box>Esemény helyszíne</Box>
            <Input
              name="eventPlace"
              value={eventPlace}
              onChange={(e) => setEventPlace(e.target.value)}
            />
          </Box>
          <Box>
            <Box>Szervezők</Box>
            <Multiselect
              name="eventOrganizers"
              options={allUsers}
              selectedValues={orgUsers}
              displayValue="name"
              onSelect={onChangeOrganizers}
              onRemove={onChangeOrganizers}
              avoidHighlightFirstOption
              closeIcon="cancel"
            />
          </Box>
          <Box>
            <Box>Esemény látogathatósága</Box>
            <Select
              name="eventClosed"
              value={eventClosed ? 'Zárt' : 'Nyílt'}
              onChange={(e) => setEventClosed(e.target.value === 'Zárt')}
            >
              <option value="Zárt">Zárt</option>
              <option value="Nyílt">Nyílt</option>
            </Select>
          </Box>
          <button type="submit">{event ? 'Edit' : 'Create'}</button>
        </form>
      </Flex>
    </Layout>
  );
}
