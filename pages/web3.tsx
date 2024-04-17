import React from 'react';
import { Flex, Space, Divider, Typography, Button, message } from 'antd';
import { parseEther } from 'viem';
import { createConfig, http, useReadContract, useWriteContract } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { WagmiWeb3ConfigProvider, MetaMask } from '@ant-design/web3-wagmi';
import { Address, NFTCard, Connector, ConnectButton, useAccount, type Chain } from '@ant-design/web3';
import { injected } from 'wagmi/connectors';
import { Mainnet, Polygon } from '@ant-design/web3-assets';
import { WalletColorful } from '@ant-design/web3-icons';

const address = '0xEcd0D12E21805803f70de03B72B1C162dB0898d9'
const tokenId = 641

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http('https://api.zan.top/node/v1/eth/mainnet/e6170f35d5ad47159626775f98bc5c2c'),
  },
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
});

const CallTest = () => {
  const { writeContract } = useWriteContract();
  const { account } = useAccount();
  const result = useReadContract({
    abi: [
      {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }],
      },
    ],
    address,
    functionName: 'balanceOf',
    args: [account?.address as `0x${string}`],
  });
  return (
    <Space>
      <Typography.Text>{result.data?.toString()}</Typography.Text>
      <Button
        onClick={() => {
          writeContract(
            {
              abi: [
                {
                  type: "function",
                  name: "mint",
                  stateMutability: "payable",
                  inputs: [
                    {
                      internalType: "uint256",
                      name: "quantity",
                      type: "uint256",
                    },
                  ],
                  outputs: [],
                },
              ],
              address,
              functionName: "mint",
              args: [1],
              value: parseEther("0.01"),
            },
            {
              onSuccess: () => {
                message.success("Mint Success");
              },
              onError: (err) => {
                message.error(err.message);
              },
            }
          );
        }}
      >
        mint
      </Button>
    </Space>
  );
}

export default function Web3() {
  const [connected, setConnected] = React.useState(false);
  const [chain, setChain] = React.useState<Chain>(Mainnet);

  return (
    <Flex style={{ height: '100vh' }} justify="center" align="center">
      <Space>
        <WagmiWeb3ConfigProvider config={config} wallets={[MetaMask()]}>
          <Address format address={address} copyable />
          <Divider />
          <NFTCard style={{ width: 350 }} address={address} tokenId={tokenId} />
          <Divider />
          <Flex justify="space-between">
            <Connector onConnected={() => setConnected(true)} onDisconnected={() => setConnected(false)}>
              <ConnectButton
                icon={<WalletColorful />}
                chain={chain}
                availableChains={[Mainnet, Polygon]}
                onSwitchChain={async (c) => {
                  setChain(c);
                }}
              />
            </Connector>
            {connected && <CallTest />}
          </Flex>
        </WagmiWeb3ConfigProvider>
      </Space>
    </Flex>
  );
};
