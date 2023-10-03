import React, { useState, useEffect } from 'react';
import { BiconomySmartAccountV2 } from '@biconomy/account';
import {
  IHybridPaymaster,
  SponsorUserOperationDto,
  PaymasterMode,
} from '@biconomy/paymaster';
import abi from './soulboundNftabi.json';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Props {
  smartAccount: BiconomySmartAccountV2;
  provider: ethers.providers.Provider;
}


export const MintSoulboundNft: React.FC<Props> = ({ smartAccount, provider }) => {
  const [count, setCount] = useState<number>(0);
  const [counterContract, setCounterContract] =
    useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const soulboundNftAddress = import.meta.env.VITE_SOULBOUND_NFT_CONTRACT_ADDRESS;

  useEffect(() => {
    setIsLoading(true);
    getCount(false);
  }, []);

  const getCount = async (isUpdating: boolean) => {
    const contract = new ethers.Contract(soulboundNftAddress, abi, provider);
    setCounterContract(contract);
    const currentCount = await contract.count();
    setCount(currentCount.toNumber());

    if (isUpdating) {
      toast.success('NFT has been issued!', {
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

      const incrementTx = new ethers.utils.Interface([
        'function safeMint()',
      ]);
      const data = incrementTx.encodeFunctionData('safeMint');

      const tx1 = {
        to: soulboundNftAddress,
        data,
      };

      const partialUserOp = await smartAccount.buildUserOp([tx1]);
      console.log("**** 0 partialUserOp: ")
      console.log(partialUserOp)
      console.log("**** 1 partialUserOp.paymasterAndData: ")
      console.log(partialUserOp.paymasterAndData)

      const BiconomyPaymaster =
        smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

        let paymasterServiceData: SponsorUserOperationDto = {
          mode: PaymasterMode.SPONSORED,
          smartAccountInfo: {
            name: 'BICONOMY',
            version: '2.0.0'
          },
          // optional params...
        };

      try {
        const paymasterAndDataResponse =
          await BiconomyPaymaster.getPaymasterAndData(
            partialUserOp,
            paymasterServiceData
          );
        partialUserOp.paymasterAndData =
          paymasterAndDataResponse.paymasterAndData;
        console.log("**** 2 partialUserOp.paymasterAndData: ")
        console.log(partialUserOp.paymasterAndData)

        const userOpResponse = await smartAccount.sendUserOp(partialUserOp);
        const transactionDetails = await userOpResponse.wait();

        console.log('Transaction Details:', transactionDetails);
        console.log('Transaction Hash:', userOpResponse.userOpHash);

        toast.success(`Transaction Hash: ${userOpResponse.userOpHash}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });

        getCount(true);
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
        position='top-right'
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />
      <br></br>
      <button onClick={() => mintSoulboundNft()}>Create Soulbound NFT of DID</button>
    </>
  );
};
