import { Box, Stack, Text, Title, useMantineTheme, Divider, Accordion, Group, Button } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import verfiablePresentation from './vc_store/medicationRequest_vp.json';
import { ONYX_API } from '../../config';
import { ToastContainer, toast } from 'react-toastify';
import { MintSoulboundNft } from './biconomy/biconomyMint';
import { Magic, RPCError, RPCErrorCode } from 'magic-sdk';
import { useMedplum } from '@medplum/react';
import { MAGIC } from '../../utils/constants';
import { useEffect, useState } from 'react';

export function VpItem(): JSX.Element {
  const [magicIsActive, setMagicIsActive] = useState<boolean>(false);
  const theme = useMantineTheme();
  const { itemId } = useParams();
  const medplum = useMedplum();

  const resource = verfiablePresentation.find((verifiablePresentation: any) => verifiablePresentation.id === itemId)!;

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const result = await MAGIC.user.isLoggedIn();
        console.log('Magic isLoggedIn: ', result);
        setMagicIsActive(result);
      } catch (error) {
        console.error('Error checking Magic logged-in state:', error);
      }
    };

    checkLoggedIn();
  }, []);

  // On fetch completion, the holder's signed verifiable presentation will be saved in
  //  ~/med_app/src/pages/verifiable-credentials/vc_store/medicationRequest_vp.json simulating the Issuers DB
  const handleVPRequest = async () => {
    try {
      const url = `${ONYX_API}/generate-cid`;
      const method = 'POST';

      // Upload DID to ipfs and get CID
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
        .then((response: any) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          // setTimeout(() => {
          //   console.log('response.json()');
          //   console.log(response.json());
          // }, 1000);
          return response.json();
        });

      console.log('data: ', data.message);

      try {
        // Mint NFT with DID and CID
      } catch (error) {}
    } catch (error) {
      console.error(error);
    }
  };

  const signInWithMagicOTP = async () => {
    console.log(medplum.getActiveLogin());

    console.log(medplum.getProfile()?.telecom?.find((t) => t.system === 'email')?.value);

    try {
      // Get email from medplum login profile and sign in with Magic
      const email = medplum.getProfile()?.telecom?.find((t) => t.system === 'email')?.value;
      if (!!email) {
        console.log('Logging in Magic with email: ', email);
        const response = await MAGIC.auth.loginWithEmailOTP({ email: email });
        console.log('response: ', response);
      } else {
        const response = await MAGIC.wallet.connectWithUI();
        console.log('response: ', response);
      }
    } catch (err) {
      if (err instanceof RPCError) {
        switch (err.code) {
          case RPCErrorCode.MagicLinkFailedVerification:
            console.log('Magic link failed');
            break;
          case RPCErrorCode.MagicLinkExpired:
            console.log('Magic link timeout');
            break;
          case RPCErrorCode.InternalError:
            console.log('Magic link cancelled');
            break;
          case RPCErrorCode.InvalidRequest:
            console.log('Magic link invalid email');
            break;
          case RPCErrorCode.MagicLinkRateLimited:
            console.log('Magic link rate limited');
            break;
        }
      }
    }
  };

  // const checkLoginStatus = async () => {
  //   console.log(await MAGIC.user.isLoggedIn());
  // }
  // const logout = async () => {
  //   console.log(await MAGIC.user.logout())
  // }

  return (
    <Box p="xl">
      <Title mb="lg">Verifiable Proof Details</Title>
      <InfoSection title={'ID: ' + resource.id}>
        <Stack spacing={0}>
          <Button onClick={async () => await signInWithMagicOTP()}>Click here to complete Magic Authorization and generate a Verifiable Proof</Button>
          {/* <Button onClick={async () => await checkLoginStatus()}>Check Login Status</Button> */}
          {/* {magicIsActive && <Button onClick={async () => await logout()}>Logout</Button>} */}
          {magicIsActive && (
            <Button onClick={async () => await handleVPRequest()}>
              Click here to claim a proof of your Verifiable Credential
            </Button>
          )}
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
