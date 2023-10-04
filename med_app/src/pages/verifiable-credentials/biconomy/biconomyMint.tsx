import React, { useState, useEffect } from 'react';
import { BiconomySmartAccountV2 } from '@biconomy/account';
import { IHybridPaymaster, SponsorUserOperationDto, PaymasterMode } from '@biconomy/paymaster';
import abi from './soulboundNftabi.json';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SOULBOUND_NFT_CONTRACT_ADDRESS, DEPLOYER_PK } from '../../../config';


interface Props {
  smartAccount: BiconomySmartAccountV2;
  provider: ethers.providers.Provider;
}


export const MintSoulboundNft: React.FC<Props> = ({ smartAccount, provider }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
  }, []);


  const mintSoulboundNft = async () => {
    console.log('Minting NFT...');
    try {
      toast.info('Processing method on the blockchain!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });

      const to = '0x59813E0B81C13d262054FD17c83460A7CE94Bbfc';
      const tokenId = 234567;
      const uri = 'test2';
      console.log('tokenId: ', tokenId);

      console.log("pk: ")
      console.log(DEPLOYER_PK)

      const deployer = new ethers.Wallet(DEPLOYER_PK, provider);
      const contract = new ethers.Contract(SOULBOUND_NFT_CONTRACT_ADDRESS, abi, provider);
      let transferCallData = contract.connect(deployer).interface.encodeFunctionData('safeMint', [to, tokenId, uri]);
      console.log("transfer call data", transferCallData);
      

    //   const mintNftTx = contract.populateTransaction.safeMint(to, tokenId, uri);
    //   console.log("data: ", (await mintNftTx).data);
    //   console.log("nonce: ", (await mintNftTx).nonce);


      // create a new ethers Interface to match the function signature function safeMint(address to, uint256 tokenId, string memory uri)
    //   const mintSoulboundNftTx = new ethers.utils.Interface([
    //     `function safeMint(address to, uint256 tokenId, string memory uri)`,
    //   ]);

     
      // encode the function call with the parameters to, tokenId, uri
    //   const funcData = mintSoulboundNftTx.encodeFunctionData('safeMint', [to, tokenId, uri]);
      const MINT_NFT_CONTRACT_ADDRESS = '0x59813E0B81C13d262054FD17c83460A7CE94Bbfc';
    //   console.log('**** 0 data: ');
    //   console.log(funcData);

      console.log('**** 1 MINT_NFT_CONTRACT_ADDRESS: ');
      console.log(MINT_NFT_CONTRACT_ADDRESS);
      const tx1 = {
        to: MINT_NFT_CONTRACT_ADDRESS,
        data: transferCallData,
      };

      const partialUserOp = (await smartAccount.buildUserOp([tx1]));
      console.log('**** 1 partialUserOp: ');
      console.log(partialUserOp);
      console.log('**** 2 partialUserOp.paymasterAndData: ');
      console.log(partialUserOp.paymasterAndData);

      const BiconomyPaymaster = smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

      let paymasterServiceData: SponsorUserOperationDto = {
        mode: PaymasterMode.SPONSORED,
        smartAccountInfo: {
          name: 'BICONOMY',
          version: '2.0.0',
        },
        // optional params...
      };

      try {
        const paymasterAndDataResponse = await BiconomyPaymaster.getPaymasterAndData(
          partialUserOp,
          paymasterServiceData
        );
        partialUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
        console.log('**** 3 partialUserOp.paymasterAndData: ');
        console.log(partialUserOp.paymasterAndData);

        const userOpResponse = await smartAccount.sendUserOp(partialUserOp);
        const transactionDetails = await userOpResponse.wait();

        console.log('Transaction Details:', transactionDetails);
        console.log('Transaction Hash:', userOpResponse.userOpHash);

        toast.success(`Transaction Hash: ${userOpResponse.userOpHash}`, {
          position: 'top-right',
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });

        // getCount(true);
      } catch (error) {
        console.error('Error executing transaction:', error);
        // ... handle the error if needed ...
      }
    } catch (error) {
      console.error('Error executing transaction:', error);
      toast.error('Error occurred, check the console', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <br></br>
      <button onClick={() => mintSoulboundNft()}>Create Soulbound NFT of DID</button>
    </>
  );
};
