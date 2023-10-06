import { Box, Stack, Text, Title, useMantineTheme, Divider, Accordion, Group, Button } from '@mantine/core';
import { Link, useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import verifiablePresentations from './vc_store/medicationRequest_vp.json';
import { useMedplum } from '@medplum/react';
import { IVerifiablePresentation } from './types/verifiablePresentation';
import { ONYX_API } from '../../config';
import { toast } from 'react-toastify';
import displayToast from '../../utils/displayToast';
import { useState } from 'react';

const TEXT = {
  vc: 'Verifiable Credential',
  vp: 'Verifiable Presentation',
};

export function VerifyItem(): JSX.Element {
  const theme = useMantineTheme();
  const { itemId } = useParams();
  const medplum = useMedplum();
  const [verifyStatus, setVerifyStatus] = useState(false);
  const [verifyZKStatus, setVerifyZKStatus] = useState(false);
  const [decodedVc, setDecodedVc] = useState('');

  const credentials = verifiablePresentations as IVerifiablePresentation[];
  const resource = credentials.find((vp: IVerifiablePresentation) => vp.id == itemId)!;

  const verifyHandler = async () => {
    // console.log(resource?.vp_signed);
    if (!resource?.vp_signed) {
      displayToast({
        type: 'error',
        message: 'No Verifiable Presentation to verify. Try Again!',
      });
      return;
    }

    try {
      const signedVPJwt = resource?.vp_signed as string;

      const url = `${ONYX_API}/verify`;
      const method = 'POST';

      const data = await toast
        .promise(
          fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vp: signedVPJwt }),
          }),
          {
            pending: 'Verifying Verifiable Presentation...',
            success: 'Verifiable Presentation verified successfully!',
            error: 'Verification failed. Please try again.',
          },
          {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
          }
        )
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        });

      setVerifyStatus(data.message);
      setDecodedVc(data.message.vc as string);
    } catch (error) {
      console.error(error);
    }
  };

  const verifyZKProof = async () => {
    // console.log(resource?.vp_signed);
    if (!decodedVc) {
      displayToast({
        type: 'error',
        message: 'No ZK Proof to verify. Try Again!',
      });
      return;
    }

    try {
      const signedVCJwt = decodedVc as string;

      const url = `${ONYX_API}/verify-zkp`;
      const method = 'POST';

      const data = await toast
        .promise(
          fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vc: signedVCJwt }),
          }),
          {
            pending: 'Verifying Verifiable Presentation...',
            success: 'Verifiable Presentation verified successfully!',
            error: 'Verification failed. Please try again.',
          },
          {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
          }
        )
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        });

      setVerifyZKStatus(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box p="xl">
      <Title mb="lg">Verifiable Proof Details</Title>
      <InfoSection title={'ID: ' + resource.id}>
        <Stack spacing={0}>
          <Divider />
          <KeyValue name="Date Issued " value={resource.date_signed as string} />
          <Divider />
          <AccordionDisplay DID_VC={resource.id} VerifiableCredential={resource.vp_signed} text={TEXT.vp} />
          <Divider />
          <Button onClick={async () => await verifyHandler()}>Verify Signed JWT</Button>
          <Divider />
          <KeyValue name="Status " value={verifyStatus ? 'Verified' : 'Not verified'} />
          <Divider />
          {verifyStatus && <AccordionDisplay DID_VC={resource.id} VerifiableCredential={decodedVc} text={TEXT.vc} />}
          <Divider />
          <Button onClick={async () => await verifyZKProof()}>Verify Zero Knowledge Proof</Button>
          <Divider />
          <KeyValue name="Status " value={verifyZKStatus ? 'Verified' : 'Not verified'} />
          <Divider />

        </Stack>
      </InfoSection>
    </Box>
  );
}

function KeyValue({ name, value }: { name: string; value: string | undefined }): JSX.Element {
  return (
    <div>
      <Text size="xs" color="gray" tt="uppercase">
        {name}
      </Text>
      <Text size="lg" weight={500} sx={{ wordWrap: 'break-word' }}>
        {value}
      </Text>
    </div>
  );
}

interface AccordionProps {
  DID_VC: string;
  VerifiableCredential: string;
  text: string;
}

function AccordionDisplay({ DID_VC, VerifiableCredential, text }: AccordionProps): JSX.Element {
  return (
    <Accordion defaultValue="Signed Verifiable Credential">
      <Accordion.Item value={DID_VC}>
        <Accordion.Control>
          <AccordionLabel DID_VC={DID_VC} VerifiableCredential={''} text={text} />
        </Accordion.Control>
        <Accordion.Panel>{VerifiableCredential}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

function AccordionLabel({ text }: AccordionProps): JSX.Element {
  return (
    <Group>
      <div>
        {/* <Text>{"Associated with VC: " + DID_VC}</Text> */}
        <Text size="sm" c="dimmed" fw={400}>
          Click to View {text} Token
        </Text>
      </div>
    </Group>
  );
}
