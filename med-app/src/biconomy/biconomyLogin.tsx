import '@biconomy/web3-auth/dist/src/style.css';
import { useState, useEffect, useRef } from 'react';
import SocialLogin from '@biconomy/web3-auth';
import { ChainId } from '@biconomy/core-types';
import { ethers } from 'ethers';
import { IBundler, Bundler } from '@biconomy/bundler';
import { BiconomySmartAccount, BiconomySmartAccountConfig, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
import { IPaymaster, BiconomyPaymaster } from '@biconomy/paymaster';
import Counter from './biconomyCounter';
import styles from '@/styles/Home.module.css';
// import { EthereumProvider } from "@walletconnect/ethereum-provider";


const bundler: IBundler = new Bundler({
  bundlerUrl: 'https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',
  chainId: ChainId.POLYGON_MAINNET,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

const paymaster: IPaymaster = new BiconomyPaymaster({
  paymasterUrl: `https://paymaster.biconomy.io/api/v1/80001/${import.meta.env.VITE_PAYMASTER_KEY}`,
});

export function BiconomyLogin() {
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [interval, enableInterval] = useState(false);
  const sdkRef = useRef<SocialLogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [provider, setProvider] = useState<any>(null);


  console.log('paymaster: ');
  console.log(paymaster);

  useEffect(() => {
    let configureLogin: NodeJS.Timeout | undefined;
    if (interval) {
      configureLogin = setInterval(() => {
        if (sdkRef.current?.provider) {
          setupSmartAccount();
          clearInterval(configureLogin);
        }
      }, 1000);
    }
  }, [interval]);

  const login = async () => {
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin();
      const signature1 = await socialLoginSDK.whitelistUrl('http://127.0.0.1:3000/');

      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI).toString(),
        network: 'testnet',
        whitelistUrls: {
          'http://127.0.0.1:3000': signature1,
        },
      });
      sdkRef.current = socialLoginSDK;
    }
    if (!sdkRef.current.provider) {
      sdkRef.current.showWallet();
      enableInterval(true);
    } else {
      setupSmartAccount();
    }
  };

  const logout = async () => {
    if (!sdkRef.current) {
      console.error('Web3Modal not initialized.');
      return;
    }
    await sdkRef.current.logout();
    sdkRef.current.hideWallet();
    setSmartAccount(null);
    enableInterval(false);
  };

  const setupSmartAccount = async () => {
    if (!sdkRef?.current?.provider) return;
    sdkRef.current.hideWallet();
    setLoading(true);
    const web3Provider = new ethers.providers.Web3Provider(sdkRef.current.provider);
    setProvider(web3Provider);

    try {
      const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        signer: web3Provider.getSigner(),
        chainId: ChainId.POLYGON_MUMBAI,
        bundler,
        paymaster,
      };
      let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig);
      biconomySmartAccount = await biconomySmartAccount.init();
      console.log('owner: ', biconomySmartAccount.owner);
      console.log('address: ', await biconomySmartAccount.getSmartAccountAddress());
      console.log(
        'deployed: ',
        await biconomySmartAccount.isAccountDeployed(await biconomySmartAccount.getSmartAccountAddress())
      );

      setSmartAccount(biconomySmartAccount);
      setLoading(false);
    } catch (err) {
      console.log('error setting up smart account... ', err);
    }
  };
  return (
    <div>
      <h1> Biconomy Smart Accounts using social login + Gasless Transactions</h1>

      {!smartAccount && !loading && <button onClick={login}>Login</button>}
      {loading && <p>Loading account details...</p>}
      {!!smartAccount && (
        <div className="buttonWrapper">
          <h3>Smart account address:</h3>
          <p>{smartAccount.address}</p>
          <Counter smartAccount={smartAccount} provider={provider} />
          <button onClick={logout}>Logout</button>
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
