import {
  ArrowDownIcon,
  ArrowUpIcon,
  CloseIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
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
import React, { useContext, useEffect, useState } from 'react';
import BeforeUnloadComponent from 'react-beforeunload-component';
import { useMutation, useQuery } from 'urql';

import { modifyFormMutation } from '../../api/form/FormModifyMutation';
import { formTemplatesGetQuery } from '../../api/form/FormTemplatesGetAllQuery';
import { eventGetInformationQuery } from '../../api/index/EventsGetInformation';
import { eventGetRegistrationQuery } from '../../api/registration/EventGetRegistrationQuery';
import {
  eventsGetTokenMutationID,
  eventsGetTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import Backtext from '../../components/control/Backtext';
import Button from '../../components/control/Button';
import { Radio, RadioGroup } from '../../components/control/RadioGroup';
import QuestionListElement from '../../components/form/QuestionListElement';
import { Layout } from '../../components/layout/Layout';
import Loading from '../../components/util/Loading';
import {
  Event,
  EventGetOneResult,
  EventGetRegistrationFormTemplatesResult,
  EventQuestionType,
  EventRegistrationFormMultipleChoiceOption,
  EventRegistrationFormMultipleChoiceQuestion,
  EventRegistrationFormQuestion,
  EventRegistrationFormQuestionInput,
  EventRegistrationFormTextQuestion,
} from '../../interfaces';
import { RoleContext } from '../../utils/services/RoleContext';
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
  const { event } = state as PageState;

  const roleContext = useContext(RoleContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [
    { fetching: eventTokenIDFetch, error: eventTokenIDError },
    getEventTokenMutationID,
  ] = useMutation(eventsGetTokenMutationID);
  const [
    {
      data: eventTokenUNData,
      fetching: eventTokenUNFetch,
      error: eventTokenUNError,
    },
    getEventTokenMutationUN,
  ] = useMutation(eventsGetTokenMutationUN);

  const [
    {
      data: getCurrentEventData,
      fetching: getCurrentEventFetch,
      error: getCurrentEventError,
    },
  ] = useQuery<EventGetOneResult>({
    query: eventGetInformationQuery,
    variables: { uniqueName },
    pause: eventTokenUNData === undefined,
  });
  const eventData = event ?? getCurrentEventData?.events_getOne;

  const [answers, setAnswers] = useState<AnswerState>({});
  const [newId, setNewId] = useState(0);
  const [newQuestion, setNewQuestion] = useState<
    EventRegistrationFormQuestion
  >();
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [newQuestionType, setNewQuestionType] = useState(
    EventQuestionType.INVALID,
  );
  const [isModified, setIsModified] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);

  const [
    {
      data: getTemplatesData,
      fetching: getTemplatesFetch,
      error: getTemplatesError,
    },
  ] = useQuery<EventGetRegistrationFormTemplatesResult>({
    query: formTemplatesGetQuery,
    variables: { id: eventData?.id },
  });

  const [
    { data: getEventData, fetching: getEventFetch, error: getEventError },
  ] = useQuery<EventGetOneResult>({
    query: eventGetRegistrationQuery,
    variables: { id: eventData?.id },
    pause: eventData === undefined,
  });

  const [questions, setQuestions] = useState<EventRegistrationFormQuestion[]>(
    getEventData?.events_getOne.registrationForm.questions ?? [],
  );
  useEffect(() => {
    if (getEventData)
      setQuestions(getEventData?.events_getOne.registrationForm.questions);
  }, [getEventData]);

  const makeToast = useToastService();

  const [, getModifyFormMutation] = useMutation(modifyFormMutation);

  useEffect(() => {
    if (event)
      getEventTokenMutationID({ id: event.id }).then((res) => {
        if (!res.error) {
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
        }
      });
    else if (uniqueName)
      getEventTokenMutationUN({ uniqueName }).then((res) => {
        if (!res.error) {
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    eventTokenIDFetch ||
    eventTokenUNFetch ||
    getCurrentEventFetch ||
    (!event && !getCurrentEventData) ||
    getEventFetch ||
    getTemplatesFetch
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenIDError ||
    eventTokenUNError ||
    getCurrentEventError ||
    getEventError ||
    getTemplatesError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/');
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
    setIsModified(true);
  };
  const moveDown = (id: string): void => {
    const movedQuestions = [...questions];
    const idx = movedQuestions.findIndex((x) => x.id === id);
    const tmp = movedQuestions[idx];
    movedQuestions[idx] = movedQuestions[idx + 1];
    movedQuestions[idx + 1] = tmp;
    setQuestions(movedQuestions);
    setIsModified(true);
  };
  const handleDeleteQuestion = (id: string): void => {
    setQuestions(questions.filter((q) => q.id !== id));
    setIsModified(true);
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
    } else if (question.metadata.type === 'multiple_choice') {
      setNewQuestionType(EventQuestionType.MULTIPLE_CHOICE);
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
  const setNewQuestionMultipleChoice = (v: boolean): void => {
    setNewQuestion({
      ...newQuestion,
      metadata: {
        ...newQuestion?.metadata,
        multipleAnswers: v,
      },
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
      setIsModified(true);
      onClose();
    } else {
      makeToast('Hiba', true, `Azonos nevű opciók: ${duplicates.join(', ')}`);
    }
  };

  const handleSubmit = (): void => {
    getModifyFormMutation({
      id: event?.id ?? getCurrentEventData?.events_getOne.id,
      form: {
        questions: questions.map((q) => {
          return {
            id: q.id.startsWith('pseudo') ? null : q.id,
            isRequired: q.isRequired,
            question: q.question,
            metadata: JSON.stringify(q.metadata),
          } as EventRegistrationFormQuestionInput;
        }),
      },
    }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        makeToast('Sikeres mentés');
        setIsModified(false);
      }
    });
  };

  return (
    <BeforeUnloadComponent blockRoute={isModified}>
      <Layout>
        <Flex flexDir="column" alignItems="center">
          <Backtext
            text="Vissza a rendezvény kezeléséhez"
            to={`/manage/${event?.uniqueName}`}
            state={{ event }}
          />
          <Box as="form" width="80%">
            <Grid
              gridTemplateColumns={['1fr', null, '4fr 4fr 7rem']}
              rowGap={['0', null, '1rem']}
            >
              {questions.map((q, idx) => (
                <React.Fragment key={q.id}>
                  <QuestionListElement
                    question={q}
                    getAnswer={getAnswer}
                    setAnswer={setAnswer}
                  />
                  <Grid
                    ml={[0, null, 4]}
                    mt={[1, null, 0]}
                    gridTemplateColumns={['repeat(4, 1fr)', null, '1fr 1fr']}
                    gridTemplateRows={['1frm', null, '3rem 3rem']}
                    columnGap={['1rem', null, 0]}
                  >
                    <Button
                      width={[null, null, '2rem']}
                      px="0.5rem"
                      mb={[null, null, 2]}
                      text={<ArrowUpIcon boxSize={6} />}
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
                      text={<ArrowDownIcon boxSize={6} />}
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
                      text={<SettingsIcon />}
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
                      text={<CloseIcon />}
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
                mb={[4, null, 0]}
                text="Új kérdés"
                onClick={openModalNewQuestion}
              />
              <Button
                width={['100%', null, '45%']}
                text="Mentés"
                onClick={handleSubmit}
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
                            width="90%"
                            text="Szöveges válasz"
                            mb={4}
                            onClick={(): void => {
                              setNewQuestionType(EventQuestionType.TEXT);
                              setNewQuestion({
                                id: 'pseudo'.concat(newId.toString()),
                                isRequired: true,
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
                            width="90%"
                            text="Feleletválasztó"
                            mb={4}
                            onClick={(): void => {
                              setNewQuestionType(
                                EventQuestionType.MULTIPLE_CHOICE,
                              );
                              setNewQuestion({
                                id: 'pseudo'.concat(newId.toString()),
                                isRequired: true,
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
                                    ) ?? 0,
                                  )
                                }
                              />
                            </Box>
                          )}
                          {newQuestionType ===
                            EventQuestionType.MULTIPLE_CHOICE && (
                            <>
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
                              <Box>
                                <Box>Több lehetőség választása</Box>
                                <RadioGroup
                                  justifyContent="space-between"
                                  value={
                                    (newQuestion?.metadata as EventRegistrationFormMultipleChoiceQuestion)
                                      .multipleAnswers
                                      ? 'Igen'
                                      : 'Nem'
                                  }
                                  onChangeCb={(e: string): void => {
                                    setNewQuestionMultipleChoice(e === 'Igen');
                                  }}
                                >
                                  <Radio width="45%" value="Nem" mb={2}>
                                    Nem
                                  </Radio>
                                  <Radio width="45%" value="Igen" mb={2}>
                                    Igen
                                  </Radio>
                                </RadioGroup>
                              </Box>
                            </>
                          )}
                          <Box>
                            <Box>Kötelező</Box>
                            <RadioGroup
                              justifyContent="space-between"
                              value={newQuestion?.isRequired ? 'Igen' : 'Nem'}
                              onChangeCb={(e: string): void => {
                                setNewQuestionRequired(e === 'Igen');
                              }}
                            >
                              <Radio width="45%" value="Nem" mb={2}>
                                Nem
                              </Radio>
                              <Radio width="45%" value="Igen" mb={2}>
                                Igen
                              </Radio>
                            </RadioGroup>
                          </Box>
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
                  backgroundColor="gray.300"
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
    </BeforeUnloadComponent>
  );
}
FormeditorPage.defaultProps = {
  location: undefined,
  uniqueName: undefined,
};
