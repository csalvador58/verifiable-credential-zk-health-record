import { Box, Stack, Text, Title, useMantineTheme, Divider, Accordion, Group, Button } from '@mantine/core';
import { StatusBadge } from '@medplum/react';
import { useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import verifiableCredentials from './vc_store/medicationRequest_vc.json';
import verifiablePresentations from './vc_store/medicationRequest_vp.json';
import { ONYX_API } from '../../config';
import { IIssuedVerifiableCredential } from './types/verifiableCredential';
import { IVerifiablePresentation } from './types/verifiablePresentation';
import { toast } from 'react-toastify';

export function VcItem(): JSX.Element {
  const theme = useMantineTheme();
  const { itemId } = useParams();

  const credentials = verifiableCredentials as IIssuedVerifiableCredential[];
  const resource = credentials.find((vc) => vc.id === itemId);

  // check if itemId has already been signed
  const status = verifiablePresentations.some((vp: IVerifiablePresentation) => vp.id === itemId);

  // On fetch completion, an issuer signed vc with zkp will be saved in
  //  ~/med_app/src/pages/verifiable-credentials/vc_store/medicationRequest_vc.json simulating the Issuers DB
  const handleVCRequest = async () => {
    console.log(resource);

    try {
      const signedVCJwt = resource?.vc_signed;

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
            pending: 'Processing signature on Verifiable Presentation...',
            success: 'Verifiable Presentation signed successfully!',
            error: 'Signature failed. Please try again.',
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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box p="xl">
      <Title mb="lg">Credential Details</Title>
      {!!resource ? (
        <InfoSection title={'ID: ' + resource.id}>
          <Stack spacing={0}>
            {!status && (
              <Button onClick={async () => await handleVCRequest()}>
                Click to sign your issued Verifiable Credential
              </Button>
            )}
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
            <KeyValue name="Signed Status" value={status ? 'Completed' : 'Not Signed'} />
            <Divider />
            <StatusBadge status={resource.vc_raw.credentialSubject.status as string} />
          </Stack>
        </InfoSection>
      ) : (
        <Text>No Verifiable Credentials found.</Text>
      )}
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
