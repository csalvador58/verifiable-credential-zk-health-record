import '@biconomy/web3-auth/dist/src/style.css';
import Web3 from 'web3';
import { useState, useEffect, useRef } from 'react';
import SocialLogin from '@biconomy/web3-auth';
import { Wallet, providers, ethers } from 'ethers';
import { ChainId } from '@biconomy/core-types';
import { Magic } from 'magic-sdk';
import { IBundler, Bundler } from '@biconomy/bundler';
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
import { IPaymaster, BiconomyPaymaster } from '@biconomy/paymaster';
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from '@biconomy/modules';
import Counter from './biconomyCounter';
import styles from '@/styles/Home.module.css';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
// import { EthereumProvider } from "@walletconnect/ethereum-provider";

const bundler: IBundler = new Bundler({
  bundlerUrl: 'https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',
  chainId: ChainId.POLYGON_MUMBAI,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

const paymaster: IPaymaster = new BiconomyPaymaster({
  paymasterUrl: `https://paymaster.biconomy.io/api/v1/80001/${import.meta.env.VITE_PAYMASTER_KEY}`,
});

// Initialize the Magic instance
export const magic = new Magic(import.meta.env.VITE_PUBLIC_MAGIC_API_KEY, {
  network: {
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    chainId: ChainId.POLYGON_MUMBAI, // or preferred chain
  },
});

export function BiconomyLogin() {
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [interval, enableInterval] = useState(false);
  const sdkRef = useRef<SocialLogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [provider, setProvider] = useState<any>(null);


  useEffect(() => {
    console.log('useEffect - magic provider status: ', !!magic?.rpcProvider, magic?.rpcProvider);
    let configureLogin: string | number | NodeJS.Timer | undefined; 
    console.log('interval: ', interval);
    if (interval) {
      configureLogin = setInterval(() => {
        console.log('Configure login...')
        if (!!magic?.rpcProvider) {
          setupSmartAccount()
          clearInterval(configureLogin)
        }
      }, 1000)
    }
  }, [interval])

  const connect = async () => {
    console.log('Connect - magic provider status: ', magic?.rpcProvider);

    if (!magic?.rpcProvider) {
      
      console.log('Connect magic: ', magic);
      try {
        enableInterval(true);
      } catch (error) {
        console.error(error);
      }
  } else {
      setupSmartAccount();
  }

   
  
  };
  
  const setupSmartAccount = async () => {
    console.log('setupSmartAccount - magic provider status: ', !!magic?.rpcProvider);
    if (!magic?.rpcProvider) return;
    await magic.wallet.connectWithUI();
    setLoading(true);
    
    try {
      console.log('setupSmartAccount');
      const web3Provider = new ethers.providers.Web3Provider(magic.rpcProvider as any);
      setProvider(web3Provider);
      const module = await ECDSAOwnershipValidationModule.create({
        signer: web3Provider.getSigner(),
        moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
      });

      console.log('web3Provider.getSigner()')
      console.log(web3Provider.getSigner())
  
      console.log('module: ', module);
      let biconomySmartAccount = await BiconomySmartAccountV2.create({
        chainId: ChainId.POLYGON_MUMBAI,
        bundler: bundler,
        paymaster: paymaster,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: module,
        activeValidationModule: module,
      });
      
      console.log("address: ", await biconomySmartAccount.getAccountAddress())
      console.log("deployed: ", await biconomySmartAccount.isAccountDeployed( await biconomySmartAccount.getAccountAddress()))
  
      setSmartAccount(biconomySmartAccount)
      setLoading(false)
    } catch (err) {
        console.log("error setting up smart account... ", err);
    }
  }

  const logout = async () => {
    if (await magic?.user.isLoggedIn()) {
      await magic?.user.logout();
    }
    setSmartAccount(null);
    setProvider(null);
    enableInterval(false);
  };
  const getInfo = async () => {
    if (await magic?.user.isLoggedIn()) {
      let info = await magic?.user.getInfo();
      console.log('info: ', info);
    }

  };

  const signMessage = async () => {
    if (await magic?.user.isLoggedIn()) {
      // let info = await magic?.user.getIdToken();
      // console.log('info: ', info);

      const web3 = new Web3(magic.rpcProvider as any);
      const publicAddress = (await magic?.user.getMetadata()).publicAddress!;

      console.log('publicAddress: ', publicAddress);

      const signedMessage = await web3?.eth.personal.sign(
        "Hello from Biconomy!",
        publicAddress,
        ""
      );

      console.log('signedMessage: ', signedMessage);
       // // recover the public address of the signer to verify
      // const recoveredAddress = web3?.eth.accounts.recover({
      //   data: 'Here is a basic message',
      //   signature: signedMessage,
      // });
      // recover the public address of the signer to verify
      const strToBufferInputType = new TextEncoder().encode("Hello from Biconomy!");
      // convert a string to a uint8array
      
      const recoveredAddress = recoverPersonalSignature({
        data: strToBufferInputType,
        signature: signedMessage!,
      });
      console.log(
        recoveredAddress?.toLocaleLowerCase() ===
        publicAddress?.toLocaleLowerCase()
          ? 'Signing success!'
          : 'Signing failed!'
      );
    }

  };

  return (
    <div>
      <h1> Biconomy Smart Accounts using Magic login + Gasless Transactions</h1>

      {!smartAccount && !loading && <button onClick={connect}>Magic Login</button>}
      {loading && <p>Loading account details...</p>}
      {!!smartAccount && (
        <div className="buttonWrapper">
          <h3>Smart account address:</h3>
          <p>{smartAccount.address}</p>
          <Counter smartAccount={smartAccount} provider={provider} />
          <button onClick={logout}>Logout</button>
          <button onClick={getInfo}>Get Info</button>
          <button onClick={signMessage}>Sign Message</button>
        </div>
      )}
      <p>
        Edit <code>src/App.tsx</code> and save to test
      </p>
      <a href="https://docs.biconomy.io/docs/overview" target="_blank" className="read-the-docs">
        Click here to check out the docs
      </a>
    </div>
  );
}
