import {
  Flex,
  Modal,
  ModalBody,
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
  children: React.ReactNode;
}

export default function InfoModal({
  isOpen,
  onClose,
  title,
  children,
}: Props): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Flex width="100%" flexDirection="column">
            <Flex justifyContent="center" width="100%">
              <Button
                width={['100%', null, '45%']}
                text="Bezárás"
                onClick={onClose}
              />
            </Flex>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
