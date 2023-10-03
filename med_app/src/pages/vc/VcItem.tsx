import { Box, Stack, Text, Title, useMantineTheme, Divider, Accordion, Group, Button } from '@mantine/core';
import { ResourceTable, StatusBadge, useMedplum } from '@medplum/react';
import { useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import verifiableCredentials from './vc_store/medicationRequest_vc.json';
import verifiablePresentations from './vc_store/medicationRequest_vp.json';
import { ToastContainer, toast } from 'react-toastify';
import { ONYX_API } from '../../config';
import { useState } from 'react';

export function VcItem(): JSX.Element {
  const theme = useMantineTheme();
  const { itemId } = useParams();

  const resource = verifiableCredentials.find((vc: any) => vc.id === itemId)!;

  // check if itemId has already been signed
  const status = verifiablePresentations.some((vp) => vp.id === itemId);

  const handleVCRequest = async () => {
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
          {
            position: 'top-center',
            autoClose: 2500,
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
          setTimeout(() => {}, 1000);
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
          {!status && <Button onClick={async () => await handleVCRequest()}>Click to sign your issued Verifiable Credential</Button>}
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
          <KeyValue name="Signed Status" value={status ? "Completed" : "Not Signed"} />
          <Divider />
          <StatusBadge status={resource.vc_raw.credentialSubject.status as string} />
          <ToastContainer />
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
