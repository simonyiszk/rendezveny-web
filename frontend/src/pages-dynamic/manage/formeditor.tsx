import { useApolloClient } from '@apollo/client';
import {
  Box,
  Flex,
  Grid,
  Input,
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
  useDisclosure,
  useToast,
} from '@chakra-ui/core';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../../components/Button';
import { Checkbox, CheckboxGroup } from '../../components/CheckboxGroup';
import { Layout } from '../../components/Layout';
import Loading from '../../components/Loading';
import { Radio, RadioGroup } from '../../components/RadioGroup';
import {
  Event,
  EventRegistration,
  EventRegistrationFormAnswer,
  EventRegistrationFormMultipleChoiceOption,
  EventRegistrationFormMultipleChoiceQuestion,
  EventRegistrationFormQuestion,
  EventRegistrationFormQuestionInput,
  EventRegistrationFormTextQuestion,
} from '../../interfaces';
import { useModifyFormMutation } from '../../utils/api/form/FormModifyMutation';
import { useFormTemplatesGetQuery } from '../../utils/api/form/FormTemplatesGetAllQuery';
import { useEventGetInformationQuery } from '../../utils/api/index/EventsGetInformation';
import { useEventGetRegistrationQuery } from '../../utils/api/registration/EventGetRegistrationQuery';
import {
  useEventTokenMutationID,
  useEventTokenMutationUN,
} from '../../utils/api/token/EventsGetTokenMutation';

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location: PageProps<null, null, PageState>['location'];
  uniqueName: string;
}

interface AnswerState {
  [key: string]: string | string[];
}

export default function FormeditorPage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state) || {};
  const { event } = state;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [answers, setAnswers] = useState<AnswerState>({});
  const [newId, setNewId] = useState(0);
  const [newQuestion, setNewQuestion] = useState<
    EventRegistrationFormQuestion
  >();
  const [newQuestionOptions, setNewQuestionOptions] = useState<
    EventRegistrationFormMultipleChoiceOption[]
  >([]);
  const [newQuestionType, setNewQuestionType] = useState(-1);

  const [questions, setQuestions] = useState<EventRegistrationFormQuestion[]>(
    [],
  );
  const [tabIndex, setTabIndex] = React.useState(0);

  const {
    called: getTemplatesCalled,
    loading: getTemplatesLoading,
    error: getTemplatesError,
    data: getTemplatesData,
  } = useFormTemplatesGetQuery();

  const [
    getEvent,
    { called: getEventCalled, loading: getEventLoading, error: getEventError },
  ] = useEventGetRegistrationQuery((queryData) => {
    setQuestions(queryData.events_getOne.registrationForm.questions);
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
    getEvent({ variables: { id: queryData.events_getOne.id } });
  });

  const client = useApolloClient();
  const [
    getEventTokenMutationID,
    { error: eventTokenMutationErrorID },
  ] = useEventTokenMutationID(client, () => {
    getEvent({ variables: { id: event.id } });
  });
  const [
    getEventTokenMutationUN,
    { error: eventTokenMutationErrorUN },
  ] = useEventTokenMutationUN(client, () => {
    getCurrentEvent({ variables: { uniqueName } });
  });

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

  const [getModifyFormMutation] = useModifyFormMutation({
    onCompleted: () => {
      makeToast('Sikeres mentés');
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
    (getTemplatesCalled && getTemplatesLoading)
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenMutationErrorID ||
    eventTokenMutationErrorUN ||
    getCurrentEventError ||
    getEventError ||
    getTemplatesError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/manage');
    }
    return <div>Error</div>;
  }

  const getAnswer = (id: string): string | string[] => {
    return answers[id];
  };
  const setAnswer = (id: string, text: string | string[]): void => {
    setAnswers({ ...answers, [id]: text });
  };

  const moveUp = (id: string): void => {
    const movedQuestions = [...questions];
    const idx = movedQuestions.findIndex((x) => x.id === id);
    const tmp = movedQuestions[idx];
    movedQuestions[idx] = movedQuestions[idx - 1];
    movedQuestions[idx - 1] = tmp;
    setQuestions(movedQuestions);
  };
  const moveDown = (id: string): void => {
    const movedQuestions = [...questions];
    const idx = movedQuestions.findIndex((x) => x.id === id);
    const tmp = movedQuestions[idx];
    movedQuestions[idx] = movedQuestions[idx + 1];
    movedQuestions[idx + 1] = tmp;
    setQuestions(movedQuestions);
  };
  const handleDeleteQuestion = (id: string): void => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const openModalNewQuestion = (): void => {
    setNewQuestionType(-1);
    onOpen();
  };

  const setNewQuestionQuestion = (v: string): void => {
    setNewQuestion({
      ...newQuestion,
      question: v,
    } as EventRegistrationFormQuestion);
  };
  const setNewQuestionRequired = (v: boolean): void => {
    setNewQuestion({
      ...newQuestion,
      isRequired: v,
    } as EventRegistrationFormQuestion);
  };
  const setNewQuestionMaxLength = (v: number): void => {
    setNewQuestion({
      ...newQuestion,
      metadata: {
        ...newQuestion?.metadata,
        maxLength: v,
      },
    } as EventRegistrationFormQuestion);
  };
  const setNewQuestionOptionText = (id: string, v: string): void => {
    const newOptions = newQuestionOptions.map((q) => {
      if (q.id !== id) return q;
      return {
        id: q.id,
        text: v,
      };
    });
    const emptyCount = newOptions.reduce((acc, curr) => {
      return acc + (curr.text.length === 0 ? 1 : 0);
    }, 0);
    if (emptyCount === 0) {
      newOptions.push({ id: newId.toString(), text: '' });
      setNewId(newId + 1);
    }
    setNewQuestionOptions(newOptions);
  };
  const handleDeleteOption = (id: string): void => {
    if (newQuestionOptions.length === 1) {
      setNewQuestionOptions([{ id: newQuestionOptions[0].id, text: '' }]);
    } else {
      setNewQuestionOptions(newQuestionOptions.filter((q) => q.id !== id));
    }
  };
  const handleNewQuestion = (): void => {
    setQuestions([
      ...questions.filter((t) => t.id !== newQuestion?.id),
      {
        ...newQuestion,
        metadata: {
          ...newQuestion?.metadata,
          ...(newQuestion?.metadata.type === 'multiple_choice' && {
            options: newQuestionOptions.filter((q) => q.text.length > 0),
          }),
        },
      } as EventRegistrationFormQuestion,
    ]);
    onClose();
  };

  const handleSubmit = async (): Promise<void> => {
    getModifyFormMutation(event?.id ?? getCurrentEventData?.events_getOne.id, {
      questions: questions.map((q) => {
        return {
          id: q.id.startsWith('pseudo') ? null : q.id,
          isRequired: q.isRequired,
          question: q.question,
          metadata: JSON.stringify(q.metadata),
        } as EventRegistrationFormQuestionInput;
      }),
    });
  };

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <Box as="form" minWidth="50%">
          <Grid
            gridTemplateColumns={['1fr', null, '4fr 4fr 1fr']}
            rowGap={['0', null, '1rem']}
          >
            {questions.map((q, idx) => (
              <React.Fragment key={q.id}>
                <Box>{q.question}</Box>
                {q.metadata.type === 'text' && (
                  <Input
                    mb={['0.5rem', null, '0']}
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
                      onChangeCb={(e: string[]): void => {
                        setAnswer(q.id, e);
                      }}
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
                      onChangeCb={(e: string): void => {
                        setAnswer(q.id, [e]);
                      }}
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
                <Flex
                  ml={[0, null, 4]}
                  flexDir={['row', null, 'column']}
                  justifyContent={['space-between', null, 'center']}
                >
                  <Button
                    width={['25%', null, '1rem']}
                    mb={2}
                    text="U"
                    onClick={(): void => {
                      if (idx !== 0) {
                        moveUp(q.id);
                      }
                    }}
                    backgroundColor={idx === 0 ? 'gray.300' : 'white'}
                  />
                  <Button
                    width={['25%', null, '1rem']}
                    mb={2}
                    text="D"
                    onClick={(): void => {
                      if (idx !== questions.length - 1) {
                        moveDown(q.id);
                      }
                    }}
                    backgroundColor={
                      idx === questions.length - 1 ? 'gray.300' : 'white'
                    }
                  />
                  <Button
                    width={['25%', null, '1rem']}
                    mb={2}
                    text="X"
                    onClick={(): void => handleDeleteQuestion(q.id)}
                    backgroundColor="red.500"
                  />
                </Flex>
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
              text="Mentés"
              onClick={handleSubmit}
            />
            <Button
              width={['100%', null, '45%']}
              text="Új kérdés"
              onClick={openModalNewQuestion}
            />
          </Flex>
        </Box>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Kérdés szerkesztése</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs
              isFitted
              variant="enclosed"
              width="100%"
              index={tabIndex}
              onChange={setTabIndex}
            >
              <TabList mb="1em">
                <Tab>Saját kérdés</Tab>
                <Tab>Sablonok</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Flex flexDir="column" alignItems="center">
                    {newQuestionType === -1 && (
                      <>
                        <Button
                          width="45%"
                          text="Szöveges válasz"
                          mb={4}
                          onClick={(): void => {
                            setNewQuestionType(0);
                            setNewQuestion({
                              id: 'pseudo'.concat(newId.toString()),
                              isRequired: false,
                              question: '',
                              metadata: {
                                maxLength: 0,
                                type: 'text',
                              } as EventRegistrationFormTextQuestion,
                            } as EventRegistrationFormQuestion);
                            setNewId(newId + 1);
                          }}
                        />
                        <Button
                          width="45%"
                          text="Radio buttons"
                          mb={4}
                          onClick={(): void => {
                            setNewQuestionType(1);
                            setNewQuestion({
                              id: 'pseudo'.concat(newId.toString()),
                              isRequired: false,
                              question: '',
                              metadata: {
                                multipleAnswers: false,
                                options: [] as EventRegistrationFormMultipleChoiceOption[],
                                type: 'multiple_choice',
                              } as EventRegistrationFormMultipleChoiceQuestion,
                            } as EventRegistrationFormQuestion);
                            setNewQuestionOptions([
                              { id: (newId + 1).toString(), text: '' },
                            ]);
                            setNewId(newId + 2);
                          }}
                        />
                        <Button
                          width="45%"
                          text="Checkbox"
                          mb={4}
                          onClick={(): void => {
                            setNewQuestionType(2);
                            setNewQuestion({
                              id: 'pseudo'.concat(newId.toString()),
                              isRequired: false,
                              question: '',
                              metadata: {
                                multipleAnswers: true,
                                options: [] as EventRegistrationFormMultipleChoiceOption[],
                                type: 'multiple_choice',
                              } as EventRegistrationFormMultipleChoiceQuestion,
                            } as EventRegistrationFormQuestion);
                            setNewQuestionOptions([
                              { id: (newId + 1).toString(), text: '' },
                            ]);
                            setNewId(newId + 2);
                          }}
                        />
                      </>
                    )}
                    {newQuestionType !== -1 && (
                      <Box width="100%">
                        <Box>Kérdés</Box>
                        <Input
                          mb={2}
                          value={newQuestion?.question}
                          onChange={(e: React.FormEvent): void =>
                            setNewQuestionQuestion(
                              (e.target as HTMLInputElement).value,
                            )
                          }
                        />
                        {newQuestionType === 0 && (
                          <Box>
                            <Box>Max hossz</Box>
                            <Input
                              mb={2}
                              value={
                                (newQuestion?.metadata as EventRegistrationFormTextQuestion)
                                  .maxLength
                              }
                              onChange={(e: React.FormEvent): void =>
                                setNewQuestionMaxLength(
                                  parseInt(
                                    (e.target as HTMLInputElement).value,
                                    10,
                                  ) || 0,
                                )
                              }
                            />
                          </Box>
                        )}
                        {newQuestionType === 1 && (
                          <Box>
                            <Box>Lehetőségek</Box>
                            <Box>
                              {newQuestionOptions.map((o) => (
                                <Flex key={o.id} mb={2}>
                                  <Input
                                    value={o.text}
                                    onChange={(e: React.FormEvent): void =>
                                      setNewQuestionOptionText(
                                        o.id,
                                        (e.target as HTMLInputElement).value,
                                      )
                                    }
                                  />
                                  <Button
                                    width={['25%', null, '1rem']}
                                    ml={4}
                                    text="X"
                                    onClick={(): void =>
                                      handleDeleteOption(o.id)
                                    }
                                    backgroundColor="red.500"
                                  />
                                </Flex>
                              ))}
                            </Box>
                          </Box>
                        )}
                        {newQuestionType === 2 && (
                          <Box>
                            <Box>Lehetőségek</Box>
                            <Box>
                              {newQuestionOptions.map((o) => (
                                <Flex key={o.id} mb={2}>
                                  <Input
                                    value={o.text}
                                    onChange={(e: React.FormEvent): void =>
                                      setNewQuestionOptionText(
                                        o.id,
                                        (e.target as HTMLInputElement).value,
                                      )
                                    }
                                  />
                                  <Button
                                    width={['25%', null, '1rem']}
                                    ml={4}
                                    text="X"
                                    onClick={(): void =>
                                      handleDeleteOption(o.id)
                                    }
                                    backgroundColor="red.500"
                                  />
                                </Flex>
                              ))}
                            </Box>
                          </Box>
                        )}
                        <Box>Kötelező</Box>
                        <RadioGroup
                          justifyContent="space-between"
                          value={newQuestion?.isRequired ? 'Igen' : 'Nem'}
                          onChangeCb={(e: string): void => {
                            setNewQuestionRequired(e === 'Igen');
                          }}
                        >
                          <Radio width="40%" value="Igen" mb={2}>
                            Igen
                          </Radio>
                          <Radio width="40%" value="Nem" mb={2}>
                            Nem
                          </Radio>
                        </RadioGroup>
                      </Box>
                    )}
                  </Flex>
                </TabPanel>
                <TabPanel>
                  <Box>b</Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Flex
              justifyContent={['center', null, 'space-between']}
              flexDir={['column', null, 'row']}
              width="100%"
            >
              <Button
                width={['100%', null, '45%']}
                text="Vissza"
                onClick={(): void => {
                  setNewQuestionType(-1);
                }}
              />
              <Button
                width={['100%', null, '45%']}
                text="Mentés"
                mt={[4, null, 0]}
                onClick={handleNewQuestion}
              />
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
