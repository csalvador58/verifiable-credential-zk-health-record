import '@biconomy/web3-auth/dist/src/style.css';
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

const connect = async (setProviderCb: any, setSmartAccountCb: any) => {

  try {
    await magic.wallet.connectWithUI();
    const web3Provider = new ethers.providers.Web3Provider(magic.rpcProvider as any);
    console.log('web3Provider: ', web3Provider);
    setProviderCb(web3Provider);
    

    const module = await ECDSAOwnershipValidationModule.create({
      signer: web3Provider.getSigner(),
      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
    });

    let biconomySmartAccount = await BiconomySmartAccountV2.create({
      chainId: ChainId.POLYGON_MUMBAI,
      bundler: bundler,
      paymaster: paymaster,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      defaultValidationModule: module,
      activeValidationModule: module,
    });

    const address = await biconomySmartAccount.getAccountAddress();
    console.log('biconomySmartAccount address: ', address);
    setSmartAccountCb(biconomySmartAccount);
  } catch (error) {
    console.error(error);
  }

};

export function BiconomyLogin() {
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [interval, enableInterval] = useState(false);
  const sdkRef = useRef<SocialLogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [provider, setProvider] = useState<any>(null);


  useEffect(() => {
    let configureLogin: NodeJS.Timeout | undefined;
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          // setupSmartAccount();
          clearInterval(configureLogin);
        }
      }, 1000);
    }
  }, [interval]);

  const connectHandler = async () => {
    connect(setProvider, setSmartAccount);
  };
  

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

  return (
    <div>
      <h1> Biconomy Smart Accounts using Magic login + Gasless Transactions</h1>

      {!smartAccount && !loading && <button onClick={connectHandler}>Magic Login</button>}
      {loading && <p>Loading account details...</p>}
      {!!smartAccount && (
        <div className="buttonWrapper">
          <h3>Smart account address:</h3>
          <p>{smartAccount.address}</p>
          <Counter smartAccount={smartAccount} provider={provider} />
          <button onClick={logout}>Logout</button>
          <button onClick={getInfo}>Get Info</button>
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
