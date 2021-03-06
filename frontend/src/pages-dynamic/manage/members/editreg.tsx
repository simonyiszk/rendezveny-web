import { Box, Flex, Grid, useDisclosure } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useState } from 'react';
import { useMutation } from 'urql';

import {
  modifyFilledInForm,
  registerDeleteMutation,
} from '../../../api/registration/RegistrationMutation';
import Button from '../../../components/control/Button';
import QuestionListElement from '../../../components/form/QuestionListElement';
import { Layout } from '../../../components/layout/Layout';
import BinaryModal from '../../../components/util/BinaryModal';
import {
  Event,
  EventRegistrationFormAnswersInput,
  EventRelation,
} from '../../../interfaces';
import useToastService from '../../../utils/services/ToastService';

interface PageState {
  user: EventRelation;
  event: Event;
  answers: AnswerState;
}
interface Props extends RouteComponentProps {
  location?: PageProps<null, null, PageState>['location'];
}

interface AnswerState {
  [key: string]: string | string[];
}

export default function EditMemberRegPage({ location }: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location?.state || (typeof history === 'object' && history.state) || {};
  const { event, user, answers } = state as PageState;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const makeToast = useToastService();

  const [, getModifyFilledInForm] = useMutation(modifyFilledInForm);
  const [, getRegisterDeleteMutation] = useMutation(registerDeleteMutation);

  const [newAnswers, setNewAnswers] = useState<AnswerState>(answers ?? {});

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
    getModifyFilledInForm({
      id: user.registration.id,
      filledInForm: generateAnswerDTO(),
    }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        makeToast('Sikeres módosítás');
        navigate(-1);
      }
    });
  };
  const handleDelete = (): void => {
    getRegisterDeleteMutation({ id: user.registration.id }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        makeToast('Sikeres leiratkozás');
        navigate(`/manage/${event?.uniqueName}/members`, { state: { event } });
      }
    });
    onClose();
  };

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <Box as="form" width="80%">
          <Grid
            gridTemplateColumns={['1fr', null, '1fr 1fr']}
            rowGap={['0', null, '1rem']}
          >
            {event?.registrationForm &&
              event?.registrationForm.questions.map((q) => (
                <QuestionListElement
                  key={q.id}
                  question={q}
                  getAnswer={getAnswer}
                  setAnswer={setAnswer}
                />
              ))}
          </Grid>
          <Flex
            justifyContent={['center', null, 'space-between']}
            flexDir={['column', null, 'row']}
            mt={4}
          >
            <Button
              width={['100%', null, '45%']}
              order={[1, null, 0]}
              text="Regisztráció törlése"
              backgroundColor="red.500"
              mt={[4, null, 0]}
              onClick={onOpen}
            />
            <Button
              width={['100%', null, '45%']}
              text="Módosítás"
              onClick={handleModify}
            />
          </Flex>
        </Box>
      </Flex>

      <BinaryModal
        isOpen={isOpen}
        onClose={onClose}
        title={`Biztosan leiratkoztatod ${user.name}t az eseményről?`}
        onAccept={handleDelete}
        onReject={onClose}
      />
    </Layout>
  );
}
EditMemberRegPage.defaultProps = {
  location: undefined,
};
