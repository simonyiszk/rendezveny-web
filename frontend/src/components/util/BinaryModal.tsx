import {
  Flex,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React from 'react';

import Button from '../control/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function BinaryModal({
  isOpen,
  onClose,
  title,
  onAccept,
  onReject,
}: Props): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
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
                onClick={onAccept}
              />
              <Button
                width={['100%', null, '45%']}
                text="Nem"
                backgroundColor="red.500"
                mt={[4, null, 0]}
                onClick={onReject}
              />
            </Flex>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
