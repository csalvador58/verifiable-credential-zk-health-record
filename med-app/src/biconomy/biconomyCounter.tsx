import React, { useState, useEffect } from 'react';
import { BiconomySmartAccountV2 } from '@biconomy/account';
import {
  IHybridPaymaster,
  SponsorUserOperationDto,
  PaymasterMode,
} from '@biconomy/paymaster';
import abi from '../utils/counterAbi.json';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Props {
  smartAccount: BiconomySmartAccountV2;
  provider: ethers.providers.Provider;
}

const TotalCountDisplay: React.FC<{ count: number }> = ({ count }) => {
  return <div>Total count is {count}</div>;
};

const Counter: React.FC<Props> = ({ smartAccount, provider }) => {
  const [count, setCount] = useState<number>(0);
  const [counterContract, setCounterContract] =
    useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  console.log("smartAccount: ", smartAccount)
  console.log("provider: ", provider)

  const counterAddress = import.meta.env.VITE_COUNTER_CONTRACT_ADDRESS;
  console.log("counterAddress: ", counterAddress)

  useEffect(() => {
    setIsLoading(true);
    getCount(false);
  }, []);

  const getCount = async (isUpdating: boolean) => {
    const contract = new ethers.Contract(counterAddress, abi, provider);
    setCounterContract(contract);
    const currentCount = await contract.count();
    setCount(currentCount.toNumber());

    if (isUpdating) {
      toast.success('Count has been updated!', {
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

  const incrementCount = async () => {
    console.log('Incrementing count...');
    try {
      toast.info('Processing count on the blockchain!', {
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
        'function incrementCount()',
      ]);
      const data = incrementTx.encodeFunctionData('incrementCount');

      const tx1 = {
        to: counterAddress,
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
      <TotalCountDisplay count={count} />
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
      <button onClick={() => incrementCount()}>Increment Count</button>
    </>
  );
};

export default Counter;
