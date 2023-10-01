import { Box, Stack, Text, Title, useMantineTheme, Divider, Accordion, Group } from '@mantine/core';
import { CarePlan } from '@medplum/fhirtypes';
import { ResourceTable, StatusBadge, useMedplum } from '@medplum/react';
import { useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import vcs from './vc_store/medicationRequest_vc.json';

export function VpItem(): JSX.Element {
  const theme = useMantineTheme();
  const { itemId } = useParams();
  // const resource: CarePlan = medplum.readResource('CarePlan', itemId as string).read();

  const resource = vcs.find((vc: any) => vc.id === itemId)!;

  return (
    <Box p="xl">
      <Title mb="lg">Credential Details</Title>
      <InfoSection title={"ID: " + resource.id}>
        <Stack spacing={0}>
          <KeyValue name="Resource Type" value={resource.vc_raw.credentialSubject.fhir.resourceType} />
          <KeyValue name="Requested Date" value={resource.vc_raw.credentialSubject.fhir.authoredOn} />
          <Divider />
          <KeyValue
            name="Medication Request"
            value={resource.vc_raw.credentialSubject.fhir.medicationCodeableConcept.text}
          />
          <Divider />
          <AccordionDisplay DIDIssuer={resource.vc_raw.issuer.id} VerifiableCredential={resource.vc_signed} />
          <Divider />
          <StatusBadge status={resource.vc_raw.credentialSubject.fhir.status as string} />
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

function AccordionDisplay({DIDIssuer, VerifiableCredential}: AccordionProps): JSX.Element {
  return (
    <Accordion defaultValue="Signed Verifiable Credential">
      <Accordion.Item value={DIDIssuer}>
        <Accordion.Control >
            <AccordionLabel DIDIssuer={DIDIssuer} VerifiableCredential={""} />
        </Accordion.Control>
        <Accordion.Panel>{VerifiableCredential}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}



function AccordionLabel({DIDIssuer}: AccordionProps): JSX.Element {
  return (
    <Group>
      <div>
        <Text>{"VC Issuer: " + DIDIssuer}</Text>
        <Text size="sm" c="dimmed" fw={400}>
          Click to View Verifiable Encrypted Credential
        </Text>
      </div>
    </Group>
  );
}
