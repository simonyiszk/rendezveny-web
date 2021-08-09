import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React from 'react';

import { Club } from '../../interfaces';

interface Props {
  useDisclosureProps: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
  };
  title: string;
  allClubs: Club[];
  selectedClubs: Club[];
  setClubs: (clubs: Club[], newClub: Club | undefined) => void;
}
export default function ClubselectorModal({
  useDisclosureProps,
  title,
  allClubs,
  selectedClubs,
  setClubs,
}: Props): JSX.Element {
  const clubIds = selectedClubs.map((c) => c.id);
  const isSelected = (c: Club): boolean => {
    return clubIds.indexOf(c.id) > -1;
  };
  const selectClub = (club: Club) => {
    if (isSelected(club)) {
      setClubs(
        selectedClubs.filter((c) => c.id !== club.id),
        undefined,
      );
    } else {
      setClubs([...selectedClubs, club], club);
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
          <Box>
            {allClubs.map((c) => (
              <Box
                key={c.id}
                backgroundColor={isSelected(c) ? 'simonyi' : 'white'}
                fontSize="1.2em"
                borderRadius="5px"
                py={1}
                px={2}
                mx={1}
                my={1}
                cursor="pointer"
                onClick={() => {
                  selectClub(c);
                }}
              >
                {c.name}
              </Box>
            ))}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Box />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
