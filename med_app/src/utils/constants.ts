import { IBundler, Bundler } from '@biconomy/bundler';
import { Magic } from 'magic-sdk';
import { ChainId } from '@biconomy/core-types';
import { DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
import { IPaymaster, BiconomyPaymaster } from '@biconomy/paymaster';
import { BICONOMY_PAYMASTER_KEY, PUBLIC_MAGIC_API } from '../config';

export const onyxApi = {
  APP_VERSION: '1.0.0',
  DOMAIN: 'http://localhost:3001',
};

export const BUNDLER: IBundler = new Bundler({
  bundlerUrl: 'https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',
  chainId: ChainId.POLYGON_MUMBAI,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

export const PAYMASTER: IPaymaster = new BiconomyPaymaster({
  paymasterUrl: `https://paymaster.biconomy.io/api/v1/80001/${BICONOMY_PAYMASTER_KEY}`,
});

export const MAGIC = new Magic(PUBLIC_MAGIC_API, {
  network: {
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    chainId: ChainId.POLYGON_MUMBAI, // or preferred chain
  },
});
