import { gql, useQuery } from '@apollo/client';
import { Flex, Heading } from '@chakra-ui/core';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../components/Button';
import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import LinkButton from '../components/LinkButton';
import { Event } from '../interfaces';
import ProtectedComponent from '../utils/protection/ProtectedComponent';

interface PageState {
  event: Event;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

export default function ManagePage({
  location: {
    state: { event },
  },
}: Props): JSX.Element {
  // const { event } = location.state;
  console.log(event);
  return (
    <Layout>
      <Heading textAlign="center" mb="2rem">
        {event.name} kezelése
      </Heading>
      <Flex flexDir="column" alignItems="center">
        <ProtectedComponent>
          <Button
            text="Résztvevők kezelése"
            width={['100%', null, '30rem']}
            mb="1rem"
            onClick={() => {
              console.log('Clicked');
            }}
          />
        </ProtectedComponent>
        <ProtectedComponent>
          <LinkButton
            text="Rendezvény kezelése"
            width={['100%', null, '30rem']}
            mb="1rem"
            to="/manage/details"
            state={{ event }}
          />
        </ProtectedComponent>
        <ProtectedComponent>
          <Button
            text="HR tábla szerkesztése"
            width={['100%', null, '30rem']}
            mb="1rem"
            onClick={() => {
              console.log('Clicked');
            }}
          />
        </ProtectedComponent>
        <ProtectedComponent>
          <LinkButton
            text="Adatok szerkesztése"
            width={['100%', null, '30rem']}
            mb="1rem"
            to="/manage/information"
            state={{ event }}
          />
        </ProtectedComponent>
        <ProtectedComponent>
          <Button
            text="Regisztrációs form"
            width={['100%', null, '30rem']}
            mb="1rem"
            onClick={() => {
              console.log('Clicked');
            }}
          />
        </ProtectedComponent>
      </Flex>
    </Layout>
  );
}
