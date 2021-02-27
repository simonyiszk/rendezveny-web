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
            <Flex justifyContent="space-between" width="100%">
              <Button
                width="45%"
                text="Nem"
                backgroundColor="gray.300"
                onClick={onReject}
              />
              <Button width="45%" text="Igen" onClick={onAccept} />
            </Flex>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
