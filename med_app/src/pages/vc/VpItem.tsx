import { Box, Stack, Text, Title, useMantineTheme, Divider, Accordion, Group } from '@mantine/core';
import { CarePlan } from '@medplum/fhirtypes';
import { ResourceTable, StatusBadge, useMedplum } from '@medplum/react';
import { useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import vcs from './vc_store/medicationRequest_vc.json';
import vp from './vc_store/medicationRequest_vp.json';

export function VpItem(): JSX.Element {
  const theme = useMantineTheme();
  const { itemId } = useParams();
  // const resource: CarePlan = medplum.readResource('CarePlan', itemId as string).read();

  const resource = vp.find((verifiablePresentation: any) => verifiablePresentation.id === itemId)!;

  return (
    <Box p="xl">
      <Title mb="lg">Verifiable Proof Details</Title>
      <InfoSection title={"ID: " + resource.id}>
        <Stack spacing={0}>
          {/* <KeyValue name="Signed VC" value={resource.id} /> */}
          <Divider />
          <AccordionDisplay DID_VC={resource.id} VerifiableCredential={resource.vp_signed} />
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
}

function AccordionDisplay({DID_VC, VerifiableCredential}: AccordionProps): JSX.Element {
  return (
    <Accordion defaultValue="Signed Verifiable Credential">
      <Accordion.Item value={DID_VC}>
        <Accordion.Control >
            <AccordionLabel DID_VC={DID_VC} VerifiableCredential={""} />
        </Accordion.Control>
        <Accordion.Panel>{VerifiableCredential}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}



function AccordionLabel({DID_VC}: AccordionProps): JSX.Element {
  return (
    <Group>
      <div>
        {/* <Text>{"Associated with VC: " + DID_VC}</Text> */}
        <Text size="sm" c="dimmed" fw={400}>
          Click to View your claimed Verifiable Encrypted Credential
        </Text>
      </div>
    </Group>
  );
}
