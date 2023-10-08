import { Box, Stack, Text, Title, useMantineTheme, Divider, Accordion, Group, Button } from '@mantine/core';
import { Link, useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import verifiablePresentations from './vc_store/medicationRequest_vp.json';
import { Magic, RPCError, RPCErrorCode } from 'magic-sdk';
import { useMedplum } from '@medplum/react';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { DEFAULT_ECDSA_OWNERSHIP_MODULE, ECDSAOwnershipValidationModule } from '@biconomy/modules';
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
import { ChainId, UserOperation } from '@biconomy/core-types';
import { BUNDLER, MAGIC, PAYMASTER } from '../../utils/constants';
import {
  IHybridPaymaster,
  SponsorUserOperationDto,
  PaymasterMode,
  IPaymaster,
  BiconomyPaymaster,
} from '@biconomy/paymaster';
import { SOULBOUND_NFT_CONTRACT_ADDRESS, DEPLOYER_PK, ONYX_API } from '../../config';
import abi from './biconomy/soulboundNftAbi.json';
import { toast } from 'react-toastify';
import displayToast from '../../utils/displayToast';
import { IVerifiablePresentation } from './types/verifiablePresentation';

export function VpItem(): JSX.Element {
  const [magicIsActive, setMagicIsActive] = useState<boolean>(false);
  const [isMinted, setIsMinted] = useState<boolean>(false);
  const [mintedTokenId, setMintedTokenId] = useState<number>(0);
  const theme = useMantineTheme();
  const { itemId } = useParams();
  const medplum = useMedplum();

  const credentials = verifiablePresentations as IVerifiablePresentation[];
  const resource = credentials.find((vp: IVerifiablePresentation) => vp.id == itemId)!;

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

    return () => {
      // Logout of Magic when user leaves page
      console.log('Logging out of Magic.');
      const logout = async () => await MAGIC.user.logout();
      logout();
      setMagicIsActive(false);
    };
  }, []);

  const signInWithMagicOTP = async () => {
    console.log(medplum.getActiveLogin());

    console.log(medplum.getProfile()?.telecom?.find((t) => t.system === 'email')?.value);

    try {
      // Get email from medplum login profile and sign in with Magic
      // const email = medplum.getProfile()?.telecom?.find((t) => t.system === 'email')?.value;
      const email = ''; // Set to empty string to force Magic to show UI
      if (!!email) {
        // console.log('Logging in Magic with email: ', email);
        const response = await MAGIC.auth.loginWithEmailOTP({ email: email });
        // console.log('response: ', response);
      } else {
        const response = await MAGIC.wallet.connectWithUI();
        // console.log('response: ', response);
      }
      setMagicIsActive(true);
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

  const handleMintNFTRequest = async () => {
    if (!resource.id) {
      displayToast({
        message: 'Unexpected error, please try again.',
        type: 'error',
      });
      console.log('resource.id is undefined');
      throw new Error('resource.id is undefined');
    } else if (!(await MAGIC.user.isLoggedIn())) {
      displayToast({
        message: 'Please login with Magic to mint NFT.',
        type: 'error',
      });
      console.log('MAGIC.rpcProvider is undefined');
      throw new Error('MAGIC.rpcProvider is undefined');
    }

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
            pending: 'Uploading DID and Metadata to IPFS',
            success: 'Successfully uploaded DID and Metadata to IPFS!',
            error: 'Error uploading DID and Metadata to IPFS. Please try again.',
          },
          {
            position: 'top-right',
            autoClose: 2000,
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

          return response.json();
        });

      console.log('data: ', data.message);

      const cid = data.message;
      const did = resource.id;

      // Mint NFT with DID and CID
      console.log('cid, did');
      console.log(cid, did);
      const result = await toast.promise(
        handleMintRequest({ cid }),
        {
          pending: 'NFT creation in progress',
          success: 'Successfully minted NFT!',
          error: 'Error occurred during transaction. Please try again after 5-10 minutes.',
        },
        {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        }
      );
      setMintedTokenId(result);
      setIsMinted(true); // Display link to Verifiable Credentials section
    } catch (error) {
      console.error(error);
    }
  };

  // const checkLoginStatus = async () => {
  //   console.log(await MAGIC.user.isLoggedIn());
  // };
  // const logout = async () => {
  //   console.log(await MAGIC.user.logout());
  // };

  return (
    <Box p="xl">
      <Title mb="lg">Verifiable Proof Details</Title>
      <InfoSection title={'ID: ' + resource.id}>
        <Stack spacing={0}>
          {!magicIsActive && (
            <Button onClick={async () => await signInWithMagicOTP()}>
              Click here to Authorize with your email login
            </Button>
          )}
          {magicIsActive && (
            <Button onClick={async () => await handleMintNFTRequest()}>
              {`Submit now to claim your NFT receipt of this DID:key into your Smart Account`}
            </Button>
          )}
          <Divider />
          <KeyValue name="Date Issued " value={resource.date_signed as string} />
          <Divider />
          <AccordionDisplay DID_VC={resource.id} VerifiableCredential={resource.vp_signed} />
          <Divider />
          {/* <Button onClick={async () => await checkLoginStatus()}>Check Login Status</Button> */}
          {/* {magicIsActive && <Button onClick={async () => await logout()}>Logout</Button>} */}
        </Stack>
      </InfoSection>
      {isMinted && mintedTokenId !== 0 && (
        <>
          <Link
            target="_blank"
            to={`https://testnets.opensea.io/assets/mumbai/${SOULBOUND_NFT_CONTRACT_ADDRESS}/${mintedTokenId}`}
            style={{ textDecoration: 'none' }}
          >
            <span style={{ fontWeight: 'bold', color: 'blue', marginLeft: '1rem' }}>
              {' '}
              Click here to view your NFT Token# {mintedTokenId} on OpenSea.
            </span>
          </Link>{' '}
        </>
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

interface MintRequest {
  cid: string;
}

const handleMintRequest = async ({ cid }: MintRequest): Promise<number> => {
  try {
    // Setup biconomy smart account
    const web3Provider = new ethers.providers.Web3Provider(MAGIC.rpcProvider as any);
    const module = await ECDSAOwnershipValidationModule.create({
      signer: web3Provider.getSigner(),
      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
    });
    let biconomySmartAccount = await BiconomySmartAccountV2.create({
      chainId: ChainId.POLYGON_MUMBAI,
      bundler: BUNDLER,
      paymaster: PAYMASTER,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      defaultValidationModule: module,
      activeValidationModule: module,
    });

    console.log('Minting NFT...');
    const to = await biconomySmartAccount.getAccountAddress();
    console.log('**** Smart Account Address: ', to);
    console.log(
      'deployed: ',
      await biconomySmartAccount.isAccountDeployed(await biconomySmartAccount.getAccountAddress())
    );
    const tokenId = Math.floor(Math.random() * 10_000_000);
    const uri = cid;

    const { partialUserOp, BiconomyPaymaster, paymasterServiceData } = (await setupMintUserOp({
      to,
      tokenId,
      uri,
      biconomySmartAccount,
      web3Provider,
    })) as MintUserOpResponse;

    displayToast({
      message: 'Submitting transaction to Paymaster',
      type: 'info',
    });
    const transactionDetails = await processPaymaster({
      partialUserOp,
      biconomySmartAccount,
      BiconomyPaymaster,
      paymasterServiceData,
    });
    console.log('transactionDetails: ', transactionDetails);

    // Return tokenId if transaction was successful
    if(transactionDetails.success === 'true') {
      return tokenId;
    } else {
      throw new Error('Error minting NFT');
    }

  } catch (error: any) {
    throw new Error(error.message);
  }
};

interface MintUserOp {
  to: string;
  tokenId: number;
  uri: string;
  biconomySmartAccount: BiconomySmartAccountV2;
  web3Provider: ethers.providers.Web3Provider;
}

interface MintUserOpResponse {
  partialUserOp: Partial<UserOperation>;
  BiconomyPaymaster: BiconomyPaymaster;
  paymasterServiceData: SponsorUserOperationDto;
}

const setupMintUserOp = async ({ to, tokenId, uri, biconomySmartAccount, web3Provider }: MintUserOp) => {
  try {
    const deployer = new ethers.Wallet(DEPLOYER_PK, web3Provider);
    const contract = new ethers.Contract(SOULBOUND_NFT_CONTRACT_ADDRESS, abi, web3Provider);
    let transferCallData = contract.connect(deployer).interface.encodeFunctionData('safeMint', [to, tokenId, uri]);

    console.log('**** MINT_NFT_CONTRACT_ADDRESS: ');
    console.log(SOULBOUND_NFT_CONTRACT_ADDRESS);
    const tx1 = {
      to: SOULBOUND_NFT_CONTRACT_ADDRESS,
      data: transferCallData,
    };
    const partialUserOp: Partial<UserOperation> = await biconomySmartAccount.buildUserOp([tx1]);
    const BiconomyPaymaster = biconomySmartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

    let paymasterServiceData: SponsorUserOperationDto = {
      mode: PaymasterMode.SPONSORED,
      smartAccountInfo: {
        name: 'BICONOMY',
        version: '2.0.0',
      },
      // optional params...
    };

    if(!!partialUserOp && !!BiconomyPaymaster && !!paymasterServiceData) {
      return { partialUserOp, BiconomyPaymaster, paymasterServiceData } as MintUserOpResponse;
    } else {
      throw new Error('Error setting up MintUserOp');
    }

  } catch (error) {
    throw new Error('Error setting up MintUserOp');
  }
};

const processPaymaster = async ({
  partialUserOp,
  biconomySmartAccount,
  BiconomyPaymaster,
  paymasterServiceData,
}: any) => {
  try {
    const paymasterAndDataResponse = await BiconomyPaymaster.getPaymasterAndData(partialUserOp, paymasterServiceData);
    partialUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

    // console.log('**** partialUserOp.paymasterAndData: ');
    // console.log(partialUserOp.paymasterAndData);

    const userOpResponse = await biconomySmartAccount.sendUserOp(partialUserOp);
    const transactionDetails = await userOpResponse.wait();

   return transactionDetails
    
  } catch (error) {
    throw new Error('Error processing Paymaster');
  }
};