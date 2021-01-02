import {
  Box,
  Flex,
  Grid,
  Input,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../../../components/Button';
import { Checkbox, CheckboxGroup } from '../../../components/CheckboxGroup';
import { Layout } from '../../../components/Layout';
import { Radio, RadioGroup } from '../../../components/RadioGroup';
import {
  Event,
  EventRegistrationFormAnswersInput,
  EventRegistrationFormMultipleChoiceQuestion,
  EventRelation,
} from '../../../interfaces';
import {
  useModifyFilledInForm,
  useRegisterDeleteMutation,
} from '../../../utils/api/registration/RegistrationMutation';

interface PageState {
  user: EventRelation;
  event: Event;
  answers: AnswerState;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

interface AnswerState {
  [key: string]: string | string[];
}

export default function EditMemberRegPage({ location }: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state) || {};
  const { event, user, answers } = state;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [newAnswers, setNewAnswers] = useState<AnswerState>({});

  const getAnswersFromProps = (): void => {
    setNewAnswers(answers);
  };

  const toast = useToast();
  const makeToast = (
    title: string,
    isError = false,
    description = '',
  ): void => {
    toast({
      title,
      description,
      status: isError ? 'error' : 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  const [getModifyFilledInForm] = useModifyFilledInForm({
    onCompleted: () => {
      makeToast('Sikeres módosítás');
      navigate(-1);
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });
  const [getRegisterDeleteMutation] = useRegisterDeleteMutation({
    onCompleted: () => {
      makeToast('Sikeres leiratkozás');
      navigate(`/manage/${event?.uniqueName}/members`, { state: { event } });
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });

  useEffect(() => {
    if (user && answers) getAnswersFromProps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  if (!answers) {
    if (typeof window !== 'undefined') {
      navigate(`/manage/${event?.uniqueName}/members/showreg`, {
        state: { event, user },
      });
    }
    return <Box>Error</Box>;
  }

  if (!event || !user) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <Box>Error</Box>;
  }

  const getAnswer = (id: string): string | string[] => {
    return newAnswers[id];
  };
  const setAnswer = (id: string, text: string | string[]): void => {
    setNewAnswers({ ...newAnswers, [id]: text });
  };

  const generateAnswerDTO = (): EventRegistrationFormAnswersInput => {
    return {
      answers: Object.entries(newAnswers).map(([key, value]) => {
        return {
          id: key,
          answer: JSON.stringify(
            Array.isArray(value)
              ? {
                  type: 'multiple_choice',
                  options: value,
                }
              : {
                  type: 'text',
                  text: value,
                },
          ),
        };
      }),
    };
  };

  const handleModify = (): void => {
    getModifyFilledInForm(user.registration.id, generateAnswerDTO());
  };
  const handleDelete = (): void => {
    getRegisterDeleteMutation(user.registration.id);
    onClose();
  };

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <Box as="form" minWidth="50%">
          <Grid
            gridTemplateColumns={['1fr', null, '1fr 1fr']}
            rowGap={['0', null, '1rem']}
          >
            {event?.registrationForm &&
              event?.registrationForm.questions.map((q) => (
                <React.Fragment key={q.id}>
                  <Box>{q.question}</Box>
                  {q.metadata.type === 'text' && (
                    <Input
                      mb={['1rem', null, '0']}
                      value={getAnswer(q.id) || ''}
                      onChange={(e: React.FormEvent): void => {
                        setAnswer(q.id, (e.target as HTMLInputElement).value);
                      }}
                    />
                  )}
                  {q.metadata.type === 'multiple_choice' &&
                    (q.metadata as EventRegistrationFormMultipleChoiceQuestion)
                      .multipleAnswers && (
                      <CheckboxGroup
                        flexDir="column"
                        value={getAnswer(q.id) || []}
                        onChangeCb={(e: string[]): void => setAnswer(q.id, e)}
                      >
                        {(q.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
                          (option) => (
                            <Checkbox key={option.id} value={option.id} mb={2}>
                              {option.text}
                            </Checkbox>
                          ),
                        )}
                      </CheckboxGroup>
                    )}
                  {q.metadata.type === 'multiple_choice' &&
                    !(q.metadata as EventRegistrationFormMultipleChoiceQuestion)
                      .multipleAnswers && (
                      <RadioGroup
                        flexDir="column"
                        value={getAnswer(q.id) ? getAnswer(q.id)[0] : ''}
                        onChangeCb={(e: string): void => setAnswer(q.id, [e])}
                      >
                        {(q.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
                          (option) => (
                            <Radio key={option.id} value={option.id} mb={2}>
                              {option.text}
                            </Radio>
                          ),
                        )}
                      </RadioGroup>
                    )}
                </React.Fragment>
              ))}
          </Grid>
          <Flex
            justifyContent={['center', null, 'space-between']}
            flexDir={['column', null, 'row']}
            mt={4}
          >
            <Button
              width={['100%', null, '45%']}
              text="Módosítás"
              onClick={handleModify}
            />
            <Button
              width={['100%', null, '45%']}
              text="Regisztráció törlése"
              backgroundColor="red.500"
              mt={[4, null, 0]}
              onClick={onOpen}
            />
          </Flex>
        </Box>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Biztosan leiratkoztatod {user.name}t az eseményről?
          </ModalHeader>
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
                  onClick={handleDelete}
                />
                <Button
                  width={['100%', null, '45%']}
                  text="Nem"
                  backgroundColor="red.500"
                  mt={[4, null, 0]}
                  onClick={onClose}
                />
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
