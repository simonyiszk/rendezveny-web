import { useDisclosure } from '@chakra-ui/react';
import { useRef } from 'react';

export default function useBinaryModalHook() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const promiseResolve = useRef<(value: unknown) => void>();

  const onOpenAsync = () => {
    return new Promise((resolve, _reject) => {
      promiseResolve.current = resolve;
      onOpen();
    });
  };

  const onAccept = () => {
    if (promiseResolve.current) promiseResolve.current(1);
    onClose();
  };

  const onReject = () => {
    if (promiseResolve.current) promiseResolve.current(0);
    onClose();
  };

  return { isOpen, onOpenAsync, onAccept, onReject };
}
