import { Box, Stack, Text, Title, useMantineTheme, Divider, Accordion, Group, Button } from '@mantine/core';
import { Link, useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import verifiablePresentations from './vc_store/medicationRequest_vp.json';
import { useMedplum } from '@medplum/react';
import { IVerifiablePresentation } from './types/verifiablePresentation';

export function VerifyItem(): JSX.Element {
  const theme = useMantineTheme();
  const { itemId } = useParams();
  const medplum = useMedplum();

  const credentials = verifiablePresentations as IVerifiablePresentation[];
  const resource = credentials.find((vp: IVerifiablePresentation) => vp.id == itemId)!;

  const logout = async () => {
    // console.log(await MAGIC.user.logout());
  };

  return (
    <Box p="xl">
      <Title mb="lg">Verifiable Proof Details</Title>
      <InfoSection title={'ID: ' + resource.id}>
        <Stack spacing={0}>
          <Divider />
          <Button onClick={async () => await logout()}>Verify</Button>
          <KeyValue name="Date Issued " value={resource.date_signed as string} />
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

function AccordionDisplay({ DID_VC, VerifiableCredential }: AccordionProps): JSX.Element {
  return (
    <Accordion defaultValue="Signed Verifiable Credential">
      <Accordion.Item value={DID_VC}>
        <Accordion.Control>
          <AccordionLabel DID_VC={DID_VC} VerifiableCredential={''} />
        </Accordion.Control>
        <Accordion.Panel>{VerifiableCredential}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

function AccordionLabel({ DID_VC }: AccordionProps): JSX.Element {
  return (
    <Group>
      <div>
        {/* <Text>{"Associated with VC: " + DID_VC}</Text> */}
        <Text size="sm" c="dimmed" fw={400}>
          Click to View Verifiable Presentation Token
        </Text>
      </div>
    </Group>
  );
}
