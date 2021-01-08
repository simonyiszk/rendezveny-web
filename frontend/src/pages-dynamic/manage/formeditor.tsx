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
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import { useModifyFormMutation } from '../../api/form/FormModifyMutation';
import { useFormTemplatesGetQuery } from '../../api/form/FormTemplatesGetAllQuery';
import { useEventGetInformationQuery } from '../../api/index/EventsGetInformation';
import { useEventGetRegistrationQuery } from '../../api/registration/EventGetRegistrationQuery';
import {
  useEventTokenMutationID,
  useEventTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import Button from '../../components/control/Button';
import {
  Checkbox,
  CheckboxGroup,
} from '../../components/control/CheckboxGroup';
import { Radio, RadioGroup } from '../../components/control/RadioGroup';
import { Layout } from '../../components/layout/Layout';
import Loading from '../../components/util/Loading';
import {
  Event,
  EventQuestionType,
  EventRegistrationFormMultipleChoiceOption,
  EventRegistrationFormMultipleChoiceQuestion,
  EventRegistrationFormQuestion,
  EventRegistrationFormQuestionInput,
  EventRegistrationFormTextQuestion,
} from '../../interfaces';
import useToastService from '../../utils/services/ToastService';

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location?: PageProps<null, null, PageState>['location'];
  uniqueName?: string;
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
    location?.state || (typeof history === 'object' && history.state) || {};
  const { event } = state;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [answers, setAnswers] = useState<AnswerState>({});
  const [newId, setNewId] = useState(0);
  const [newQuestion, setNewQuestion] = useState<
    EventRegistrationFormQuestion
  >();
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [newQuestionType, setNewQuestionType] = useState(
    EventQuestionType.INVALID,
  );

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

  const makeToast = useToastService();

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

  const openModalLoadQuestion = (
    question: EventRegistrationFormQuestion,
    withIndex: boolean,
  ): void => {
    setNewQuestion({
      ...question,
      ...(!withIndex && { id: 'pseudo'.concat(newId.toString()) }),
    });
    if (!withIndex) setNewId(newId + 1);
    if (question.metadata.type === 'text') {
      setNewQuestionType(EventQuestionType.TEXT);
    } else if (
      question.metadata.type === 'multiple_choice' &&
      !(question.metadata as EventRegistrationFormMultipleChoiceQuestion)
        .multipleAnswers
    ) {
      setNewQuestionType(EventQuestionType.RADIOBUTTON);
      setNewQuestionOptions(
        (question.metadata as EventRegistrationFormMultipleChoiceQuestion).options
          .map((o) => o.text)
          .join('\n'),
      );
    } else if (
      question.metadata.type === 'multiple_choice' &&
      (question.metadata as EventRegistrationFormMultipleChoiceQuestion)
        .multipleAnswers
    ) {
      setNewQuestionType(EventQuestionType.CHECKBOX);
      setNewQuestionOptions(
        (question.metadata as EventRegistrationFormMultipleChoiceQuestion).options
          .map((o) => o.text)
          .join('\n'),
      );
    }
  };
  const openModalNewQuestion = (): void => {
    setNewQuestionType(EventQuestionType.INVALID);
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

  const transformTextToId = (text: string): string => {
    const ret = text.toLowerCase().trim().replace(/ /g, '-');
    return ret;
  };

  const handleNewQuestion = (): void => {
    const newQuestionOptionsArray = newQuestionOptions.split('\n');
    const duplicates = newQuestionOptionsArray.filter(
      (item, index) => newQuestionOptionsArray.indexOf(item) !== index,
    );
    if (duplicates.length === 0) {
      const modifiedQuestion = {
        ...newQuestion,
        metadata: {
          ...newQuestion?.metadata,
          ...(newQuestion?.metadata.type === 'multiple_choice' && {
            options: newQuestionOptions.split('\n').map((o) => {
              return {
                id: transformTextToId(o),
                text: o,
              };
            }),
          }),
        },
      } as EventRegistrationFormQuestion;
      const index = questions.findIndex((t) => t.id === newQuestion?.id);
      if (index === -1) {
        setQuestions([...questions, modifiedQuestion]);
      } else {
        setQuestions(
          questions.map((t) => {
            if (t.id !== newQuestion?.id) return t;
            return modifiedQuestion;
          }),
        );
      }
      onClose();
    } else {
      makeToast('Hiba', true, `Azonos nevű opciók: ${duplicates.join(', ')}`);
    }
  };

  const handleSubmit = (): void => {
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
        <Box as="form" width="80%">
          <Grid
            gridTemplateColumns={['1fr', null, '4fr 4fr 7rem']}
            rowGap={['0', null, '1rem']}
          >
            {questions.map((q, idx) => (
              <React.Fragment key={q.id}>
                <Box
                  mt={[4, null, 0]}
                  fontWeight="bold"
                  mb={[2, null, 0]}
                  fontSize={['1.25rem', null, '1rem']}
                  textAlign={['center', null, 'left']}
                >
                  {q.question}
                </Box>
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
                <Grid
                  ml={[0, null, 4]}
                  mt={[1, null, 0]}
                  gridTemplateColumns={['repeat(4, 1fr)', null, '1fr 1fr']}
                  columnGap={['1rem', null, 0]}
                >
                  <Button
                    width={[null, null, '2rem']}
                    px="0.5rem"
                    mb={[null, null, 2]}
                    text="U"
                    onClick={(): void => {
                      if (idx !== 0) {
                        moveUp(q.id);
                      }
                    }}
                    backgroundColor={idx === 0 ? 'gray.300' : 'white'}
                    cursor={idx === 0 ? 'default' : 'pointer'}
                  />
                  <Button
                    width={[null, null, '2rem']}
                    px="0.5rem"
                    mb={[null, null, 2]}
                    text="D"
                    onClick={(): void => {
                      if (idx !== questions.length - 1) {
                        moveDown(q.id);
                      }
                    }}
                    backgroundColor={
                      idx === questions.length - 1 ? 'gray.300' : 'white'
                    }
                    cursor={
                      idx === questions.length - 1 ? 'default' : 'pointer'
                    }
                  />
                  <Button
                    width={[null, null, '2rem']}
                    px="0.5rem"
                    mb={[null, null, 2]}
                    text="E"
                    onClick={(): void => {
                      openModalLoadQuestion(q, true);
                      onOpen();
                    }}
                    gridArea={[null, null, '1 / 2 / 1 / 2']}
                  />
                  <Button
                    width={[null, null, '2rem']}
                    px="0.5rem"
                    mb={[null, null, 2]}
                    text="X"
                    onClick={(): void => handleDeleteQuestion(q.id)}
                    backgroundColor="red.500"
                  />
                </Grid>
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
                    {newQuestionType === EventQuestionType.INVALID && (
                      <>
                        <Button
                          width="45%"
                          text="Szöveges válasz"
                          mb={4}
                          onClick={(): void => {
                            setNewQuestionType(EventQuestionType.TEXT);
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
                            setNewQuestionType(EventQuestionType.RADIOBUTTON);
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
                            setNewQuestionOptions('');
                            setNewId(newId + 1);
                          }}
                        />
                        <Button
                          width="45%"
                          text="Checkbox"
                          mb={4}
                          onClick={(): void => {
                            setNewQuestionType(EventQuestionType.CHECKBOX);
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
                            setNewQuestionOptions('');
                            setNewId(newId + 1);
                          }}
                        />
                      </>
                    )}
                    {newQuestionType !== EventQuestionType.INVALID && (
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
                        {newQuestionType === EventQuestionType.TEXT && (
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
                        {newQuestionType === EventQuestionType.RADIOBUTTON && (
                          <Box>
                            <Box>Lehetőségek</Box>
                            <Textarea
                              value={newQuestionOptions}
                              onChange={(e: React.FormEvent): void => {
                                setNewQuestionOptions(
                                  (e.target as HTMLInputElement).value,
                                );
                              }}
                            />
                          </Box>
                        )}
                        {newQuestionType === EventQuestionType.CHECKBOX && (
                          <Box>
                            <Box>Lehetőségek</Box>
                            <Textarea
                              value={newQuestionOptions}
                              onChange={(e: React.FormEvent): void => {
                                setNewQuestionOptions(
                                  (e.target as HTMLInputElement).value,
                                );
                              }}
                            />
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
                  <Box>
                    {getTemplatesData?.events_getRegistrationFormTemplates.nodes.map(
                      (t) => (
                        <Box
                          key={t.id}
                          boxShadow="rgb(210, 210, 210) 1px 1px 2px 2px"
                          borderRadius="5px"
                          width="100%"
                          py={1}
                          px={2}
                          mb={4}
                          cursor="pointer"
                          onClick={(): void => {
                            openModalLoadQuestion(t, false);
                            setTabIndex(0);
                          }}
                        >
                          <Box>{t.question}</Box>
                          {t.metadata.type === 'multiple_choice' && (
                            <Box ml={2}>
                              {(t.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
                                (o) => (
                                  <Box key={o.id}>{o.text}</Box>
                                ),
                              )}
                            </Box>
                          )}
                        </Box>
                      ),
                    )}
                  </Box>
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
                  setNewQuestionType(EventQuestionType.INVALID);
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
FormeditorPage.defaultProps = {
  location: undefined,
  uniqueName: undefined,
};
