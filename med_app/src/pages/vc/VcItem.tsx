import { Box, Stack, Text, Title, useMantineTheme, Divider, Accordion } from '@mantine/core';
import { CarePlan } from '@medplum/fhirtypes';
import { ResourceTable, StatusBadge, useMedplum } from '@medplum/react';
import { useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import vcs from './vc_store/medicationRequest_vc.json';

export function VcItem(): JSX.Element {
  const theme = useMantineTheme();
  const { itemId } = useParams();
  // const resource: CarePlan = medplum.readResource('CarePlan', itemId as string).read();

  const resource = vcs.find((vc: any) => vc.id === itemId)!;

  return (
    <Box p="xl">
      <Title mb="lg">Credential Details</Title>
      <InfoSection title={"DID: " + resource.id}>
        <Stack spacing={0}>
          <KeyValue name="Resource Type" value={resource.vc_raw.credentialSubject.fhir.resourceType} />
          <KeyValue name="Requested Date" value={resource.vc_raw.credentialSubject.fhir.authoredOn} />
          <Divider />
          <KeyValue
            name="Medication Request"
            value={resource.vc_raw.credentialSubject.fhir.medicationCodeableConcept.text}
          />
          <Divider />
          <AccordionDisplay resource={resource.vc_signed} />
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

function AccordionDisplay({ resource }: {resource: string}): JSX.Element {
  return (
    <Accordion defaultValue="Signed Verifiable Credential">
      <Accordion.Item value={resource}>
        <Accordion.Control >{"Click to View Issued Signed Vendor Credential"}</Accordion.Control>
        <Accordion.Panel>{resource}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
