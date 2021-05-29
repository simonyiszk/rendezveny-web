import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useClient } from 'urql';

import { clubsGetClubMembersQuery } from '../../api/details/ClubsGetOtherMembersQuery';
import { Club, ClubGetOneResult, User } from '../../interfaces';
import UserSelector from './UserSelector';

interface Props {
  clubs: Club[];
  useDisclosureProps: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
  };
  title: string;
  users: User[];
  setUsers: (users: User[], newUser: User | undefined) => void;
}

interface MembersData {
  [key: string]: User[];
}

export default function UserSelectorModal({
  clubs,
  useDisclosureProps,
  title,
  users,
  setUsers,
}: Props): JSX.Element {
  const client = useClient();

  const initialTabIndex = 0;
  const [tabIndex, setTabIndex] = useState(initialTabIndex);

  const [membersData, setMembersData] = useState<MembersData>({});

  useEffect(() => {
    if (clubs.length > 0) {
      client
        .query<ClubGetOneResult>(clubsGetClubMembersQuery, {
          id: clubs[initialTabIndex].id,
        })
        .toPromise()
        .then((result) => {
          if (result.data && !result.error) {
            setMembersData({
              ...membersData,
              [result.data.clubs_getOne
                .id]: result.data.clubs_getOne.clubMemberships.nodes
                .map((m) => m.user)
                .sort((a, b) => a.name.localeCompare(b.name)),
            });
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeTab = (tabidx: number) => {
    setTabIndex(tabidx);
    const currentClubIndex = clubs[tabidx].id;
    if (!membersData[currentClubIndex]) {
      client
        .query<ClubGetOneResult>(clubsGetClubMembersQuery, {
          id: currentClubIndex,
        })
        .toPromise()
        .then((result) => {
          if (result.data && !result.error) {
            setMembersData({
              ...membersData,
              [result.data.clubs_getOne
                .id]: result.data.clubs_getOne.clubMemberships.nodes
                .map((m) => m.user)
                .sort((a, b) => a.name.localeCompare(b.name)),
            });
          }
        });
    }
  };

  const selectUser = (user: User) => {
    if (users.map((u) => u.id).indexOf(user.id) > -1) {
      setUsers(
        users.filter((u) => u.id !== user.id),
        undefined,
      );
    } else {
      setUsers([...users, user], user);
    }
  };

  return (
    <Modal
      isOpen={useDisclosureProps.isOpen}
      onClose={useDisclosureProps.onClose}
      scrollBehavior="inside"
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs
            orientation="vertical"
            width="100%"
            index={tabIndex}
            onChange={onChangeTab}
          >
            <TabList mb="1em">
              {clubs.map((c) => (
                <Tab key={c.id}>{c.name}</Tab>
              ))}
            </TabList>
            <TabPanels>
              {clubs.map((c) => (
                <TabPanel key={c.id}>
                  {!membersData[c.id] && <Box>Loading...</Box>}
                  {membersData[c.id] && (
                    <UserSelector
                      users={membersData[c.id]}
                      selectedUsers={users}
                      onClick={selectUser}
                    />
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Box />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
