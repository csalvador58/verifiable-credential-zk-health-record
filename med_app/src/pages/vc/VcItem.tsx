import { Box, Stack, Text, Title, useMantineTheme, Divider, Accordion, Group, Button } from '@mantine/core';
import { CarePlan } from '@medplum/fhirtypes';
import { ResourceTable, StatusBadge, useMedplum } from '@medplum/react';
import { useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import vcs from './vc_store/medicationRequest_vc.json';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { ONYX_API } from '../../config';

type SignedVC = [string, boolean];

export function VcItem(): JSX.Element {
  const theme = useMantineTheme();
  const { itemId } = useParams();
  const [signedVC, setSignedVC] = useState<SignedVC>(['', false]);
  // const resource: CarePlan = medplum.readResource('CarePlan', itemId as string).read();

  const resource = vcs.find((vc: any) => vc.id === itemId)!;

  const handleVPRequest = async () => {
    setSignedVC(['', false]);

    console.log(resource);

    try {
      const signedVCJwt = resource.vc_signed;
      console.log(signedVCJwt);
      const url = `${ONYX_API}/create-signed-vp`;
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
            pending: 'Requesting VC...',
            success: 'VC Requested!',
            error: 'Error requesting VC.',
          },
          { autoClose: false }
        )
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          setTimeout(() => {
            setSignedVC([data.message, true]);
          }, 1000);
          return response.json();
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box p="xl">
      <Title mb="lg">Credential Details</Title>
      <InfoSection title={'ID: ' + resource.id}>
        <Stack spacing={0}>
          <Button onClick={async () => await handleVPRequest()}>
            Click here to claim a proof of your Verifiable Credential
          </Button>
          <KeyValue name="Resource Type" value={resource.vc_raw.credentialSubject.resourceType} />
          <KeyValue name="Requested Date" value={resource.vc_raw.credentialSubject.authoredOn} />
          <Divider />
          <KeyValue
            name="Medication Request"
            value={JSON.parse(resource.vc_raw.credentialSubject.medicationCodeableConcept).text}
          />
          <Divider />
          <AccordionDisplay DIDIssuer={resource.vc_raw.issuer.id} VerifiableCredential={resource.vc_signed} />
          <Divider />
          <StatusBadge status={resource.vc_raw.credentialSubject.status as string} />
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
  DIDIssuer: string;
  VerifiableCredential: string;
}

function AccordionDisplay({ DIDIssuer, VerifiableCredential }: AccordionProps): JSX.Element {
  return (
    <Accordion defaultValue="Signed Verifiable Credential">
      <Accordion.Item value={DIDIssuer}>
        <Accordion.Control>
          <AccordionLabel DIDIssuer={DIDIssuer} VerifiableCredential={''} />
        </Accordion.Control>
        <Accordion.Panel>{VerifiableCredential}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

function AccordionLabel({ DIDIssuer }: AccordionProps): JSX.Element {
  return (
    <Group>
      <div>
        <Text>{'VC Issuer: ' + DIDIssuer}</Text>
        <Text size="sm" c="dimmed" fw={400}>
          Click to View Verifiable Encrypted Credential
        </Text>
      </div>
    </Group>
  );
}
