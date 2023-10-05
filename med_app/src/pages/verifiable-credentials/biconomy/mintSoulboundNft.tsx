// import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
// import {
//   IHybridPaymaster,
//   SponsorUserOperationDto,
//   PaymasterMode,
//   IPaymaster,
//   BiconomyPaymaster,
// } from '@biconomy/paymaster';
// import abi from './soulboundNftabi.json';
// import { ethers } from 'ethers';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { SOULBOUND_NFT_CONTRACT_ADDRESS, DEPLOYER_PK, PUBLIC_MAGIC_API } from '../../../config';
// import { Bundler, IBundler } from '@biconomy/bundler';
// import { ChainId } from '@biconomy/core-types';
// import { Magic } from 'magic-sdk';
// import { DEFAULT_ECDSA_OWNERSHIP_MODULE, ECDSAOwnershipValidationModule } from '@biconomy/modules';
// import { BUNDLER, MAGIC, PAYMASTER } from '../../../utils/constants';
// import { Button } from '@mantine/core';

// interface Props {
//   biconomySmartAccount: BiconomySmartAccountV2;
//   web3Provider: ethers.providers.Web3Provider;
// }

// interface MintUserOp extends Props {
//   to: string;
//   tokenId: number;
//   uri: string;
// }

// export function MintSoulBoundNft(): JSX.Element {
  
//   const handleMintRequest = async () => {
//     // console.log('Logging in with Magic...');
//     // // Magic login
//     // toast.info('Please log into Magic to continue...', {
//     //   position: 'top-right',
//     //   autoClose: 2500,
//     //   hideProgressBar: false,
//     //   closeOnClick: true,
//     //   pauseOnHover: false,
//     //   draggable: false,
//     //   progress: undefined,
//     //   theme: 'light',
//     // });
//     // await MAGIC.wallet.connectWithUI();

//     // Setup biconomy smart account
//     const web3Provider = new ethers.providers.Web3Provider(MAGIC.rpcProvider as any);
//     const module = await ECDSAOwnershipValidationModule.create({
//       signer: web3Provider.getSigner(),
//       moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
//     });

//     let biconomySmartAccount = await BiconomySmartAccountV2.create({
//       chainId: ChainId.POLYGON_MUMBAI,
//       bundler: BUNDLER,
//       paymaster: PAYMASTER,
//       entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
//       defaultValidationModule: module,
//       activeValidationModule: module,
//     });

//     console.log('Minting NFT...');
//     try {
//       toast.info('Now minting NFT!', {
//         position: 'top-right',
//         autoClose: 2500,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: false,
//         draggable: false,
//         progress: undefined,
//         theme: 'light',
//       });

//       const to = await biconomySmartAccount.getAccountAddress();
//       console.log('**** Smart Account Address: ', to);
//       console.log(
//         'deployed: ',
//         await biconomySmartAccount.isAccountDeployed(await biconomySmartAccount.getAccountAddress())
//       );
//       const tokenId = Math.floor(Math.random() * 10_000_000_000);
//       const uri = 'test2';

//       try {
//         const { partialUserOp, BiconomyPaymaster, paymasterServiceData } = await setupMintUserOp({
//           to,
//           tokenId,
//           uri,
//           biconomySmartAccount,
//           web3Provider,
//         });

//         const userOpResponse = await processPaymaster({
//           partialUserOp,
//           biconomySmartAccount,
//           BiconomyPaymaster,
//           paymasterServiceData,
//         });

//         toast.success(`Transaction Hash: ${userOpResponse.userOpHash}`, {
//           position: 'top-right',
//           autoClose: 10000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: false,
//           draggable: true,
//           progress: undefined,
//           theme: 'light',
//         });

//         // getCount(true);
//       } catch (error) {
//         console.error('Error executing transaction:', error);
//         // ... handle the error if needed ...
//       }
//     } catch (error) {
//       console.error('Error executing transaction:', error);
//       toast.error('Error occurred, check the console', {
//         position: 'top-right',
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: 'dark',
//       });
//     }
//   };

//   return (
//     <div>
//       NFT is being generated
//     </div>
//   );
// }

// const setupMintUserOp = async ({ to, tokenId, uri, biconomySmartAccount, web3Provider }: MintUserOp) => {
//   const deployer = new ethers.Wallet(DEPLOYER_PK, web3Provider);
//   const contract = new ethers.Contract(SOULBOUND_NFT_CONTRACT_ADDRESS, abi, web3Provider);
//   let transferCallData = contract.connect(deployer).interface.encodeFunctionData('safeMint', [to, tokenId, uri]);

//   console.log('**** MINT_NFT_CONTRACT_ADDRESS: ');
//   console.log(SOULBOUND_NFT_CONTRACT_ADDRESS);
//   const tx1 = {
//     to: SOULBOUND_NFT_CONTRACT_ADDRESS,
//     data: transferCallData,
//   };

//   const partialUserOp = await biconomySmartAccount.buildUserOp([tx1]);
//   const BiconomyPaymaster = biconomySmartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

//   let paymasterServiceData: SponsorUserOperationDto = {
//     mode: PaymasterMode.SPONSORED,
//     smartAccountInfo: {
//       name: 'BICONOMY',
//       version: '2.0.0',
//     },
//     // optional params...
//   };

//   return { partialUserOp, BiconomyPaymaster, paymasterServiceData };
// };

// const processPaymaster = async ({
//   partialUserOp,
//   biconomySmartAccount,
//   BiconomyPaymaster,
//   paymasterServiceData,
// }: any) => {
//   const paymasterAndDataResponse = await BiconomyPaymaster.getPaymasterAndData(partialUserOp, paymasterServiceData);
//   partialUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

//   console.log('**** partialUserOp.paymasterAndData: ');
//   console.log(partialUserOp.paymasterAndData);

//   const userOpResponse = await biconomySmartAccount.sendUserOp(partialUserOp);
//   const transactionDetails = await userOpResponse.wait();

//   console.log('Transaction Details:', transactionDetails);
//   console.log('Transaction Hash:', userOpResponse.userOpHash);

//   return userOpResponse;
// };
