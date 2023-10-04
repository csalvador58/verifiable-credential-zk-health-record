import { Box, Stack, Text, Title, useMantineTheme, Divider, Accordion, Group, Button } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import verfiablePresentation from './vc_store/medicationRequest_vp.json';
import { ONYX_API } from '../../config';
import { ToastContainer, toast } from 'react-toastify';
import { MintSoulboundNft } from './biconomy/biconomyMint';

export function VpItem(): JSX.Element {
  const theme = useMantineTheme();
  const { itemId } = useParams();

  const resource = verfiablePresentation.find((verifiablePresentation: any) => verifiablePresentation.id === itemId)!;

  // On fetch completion, the holder's signed verifiable presentation will be saved in
  //  ~/med_app/src/pages/verifiable-credentials/vc_store/medicationRequest_vp.json simulating the Issuers DB
  const handleVPRequest = async () => {
    try {
      const url = `${ONYX_API}/generate-cid`;
      const method = 'POST';

      const data = await toast
        .promise(
          fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ did: resource.id }),
          }),
          {
            pending: 'Requesting VP...',
            success: 'VP Requested!',
            error: 'Error requesting VP.',
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
          setTimeout(() => {
            console.log('response.json()');
            console.log(response.json());
          }, 1000);
          // return response.json();
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box p="xl">
      <Title mb="lg">Verifiable Proof Details</Title>
      <InfoSection title={'ID: ' + resource.id}>
        <Stack spacing={0}>
          <Button onClick={async () => await handleVPRequest()}>
            Click here to claim a proof of your Verifiable Credential
          </Button>
          <Divider />
          <KeyValue name="Date Issued " value={resource.date_signed as string} />
          <Divider />
          <AccordionDisplay DID_VC={resource.id} VerifiableCredential={resource.vp_signed} />
          <Divider />
          {/* <MintSoulboundNft /> */}
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
          Click to View your claimed Verifiable Encrypted Credential
        </Text>
      </div>
    </Group>
  );
}
