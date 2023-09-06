import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import styles from "../styles/Home.module.css";
import Web3 from "web3";
import Web3Modal from "web3modal";
import { ethers, providers } from "ethers";
import { providerOptions } from "../contracts/utils";
import {
    BACKEND_URL,
  CHAIN_ID,
  NETWORK,
  SITE_ERROR,
  SMARCONTRACT_INI_ABI,
  StakingContract_ABI,
  StakingContract_Address,
  StakingContract_Address_NFT,
} from "../../config";
import NFTCard from "../components/NFTCard";
import { errorAlertCenter, successAlert } from "../components/toastGroup";
import { Container, Grid, Button } from "@mui/material";
import UnNFTCard from "../components/UnNFTCard";
import { PageLoading } from "../components/Loading";

import TicTacToeModal from "../components/TicTacToeModal";
import { useApp } from "../contexts/AppContext";

let web3Modal = undefined;
let contract = undefined;
let contract_nft = undefined;

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [signerAddress, setSignerAddress] = useState("");
  const [unstakedNFTs, setUnstakedNFTs] = useState();
  const [stakedNFTs, setStakedNFTs] = useState();
  const [loading, setLoading] = useState(false);
  const [stakeAllLoading, setStakeAllLoading] = useState(false);
  const [unstakeAllLoading, setUnstakeAllLoading] = useState(false);
  const [claimAllLoading, setClaimAllLoading] = useState(false);
  const [rand, setRand] = useState(0);
  const [response, setResponse] = useState();
  const [open, setOpen] = useState(false);

  const {setGameModalOpen, gameModalOpen, setSigner, setTokens, setRelease} = useApp()

  const connectWallet = async () => {
    if (await checkNetwork()) {
      setLoading(true);
      web3Modal = new Web3Modal({
        network: NETWORK, // optional
        cacheProvider: true,
        providerOptions, // required
      });
      try {
        const provider = await web3Modal.connect();
        const web3Provider = new providers.Web3Provider(provider);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();

        setConnected(true);
        setSignerAddress(address);
        setSigner(address);

        contract = new ethers.Contract(
          StakingContract_Address,
          StakingContract_ABI,
          signer
        );

        contract_nft = new ethers.Contract(
          StakingContract_Address_NFT,
          SMARCONTRACT_INI_ABI,
          signer
        );

        /////////////////
        updatePage(address);
        /////////////////

        // Subscribe to accounts change
        provider.on("accountsChanged", (accounts) => {
          console.log(accounts[0], "--------------");
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const updatePage = useCallback(
    async (address) => {
      setLoading(true);
      let unstaked = [];
      let staked = [];
      const balance = await contract_nft.balanceOf(address);
      const stakedAmount = await contract.stakedAmount(address);
      console.log(stakedAmount);
      setSigner(address);
      let total = 0;
      try {
        let promise_index = [];
        for (let i = 0; i < parseInt(balance); i++) {
          promise_index.push(contract_nft.tokenOfOwnerByIndex(address, i));
        }
        const indexData = await Promise.all(promise_index);
        for (let i = 0; i < indexData.length; i++) {
          unstaked.push({
            id: parseInt(indexData[i]),
            tokenId: parseInt(indexData[i]),
          });
        }

        let promise = [];
        for (let i = 0; i < parseInt(stakedAmount); i++) {
          promise.push(contract.stakedIds(address, i));
        }
        const data = await Promise.all(promise);

        for (let i = 0; i < data.length; i++) {
          total++;
          console.log(i, "==============", data[i].toNumber());
          staked.push({
            id: i,
            tokenId: data[i].toNumber(),
          });
        }
      } catch (error) {
        console.log(error);
      }
      setUnstakedNFTs(unstaked);
      setStakedNFTs(staked);
      setLoading(false);
    },
    [response]
  );

  const checkNetwork = async () => {
    const web3 = new Web3(Web3.givenProvider);
    const chainId = await web3.eth.getChainId();
    if (chainId === CHAIN_ID) {
      return true;
    } else {
      errorAlertCenter(SITE_ERROR[0]);
      return false;
    }
  };

  const handleOpen = (release, stakedNFTs) => {
    let tokenIds = [];
    for (let item of stakedNFTs) {
        tokenIds.push(item.tokenId);
    }
    
    setSigner()
    setRelease(release);
    setTokens(tokenIds);
    setGameModalOpen(true);
  };

  const onStakeAll = async () => {
    let unstaked = [];
    for (let item of unstakedNFTs) {
      unstaked.push(item.id);
    }
    try {
      const approved = await contract_nft.isApprovedForAll(
        signerAddress,
        StakingContract_Address
      );
      console.log(approved, "approved");
      if (!approved) {
        const approve = await contract_nft.setApprovalForAll(
          StakingContract_Address,
          true
        );
        await approve.wait();
      }
      const stake = await contract.stakeNFT(unstaked);
      await stake.wait();
      successAlert("Staking is successful.");
      updatePage(signerAddress);
    } catch (error) {
      setStakeAllLoading(false);
      console.log(error);
    }
    setStakeAllLoading(false);
  };


  useEffect(() => {
    async function fetchData() {
      if (typeof window.ethereum !== "undefined") {
        if (await checkNetwork()) {
          await connectWallet();
          ethereum.on("accountsChanged", function (accounts) {
            window.location.reload();
          });
          if (ethereum.selectedAddress !== null) {
            setSignerAddress(ethereum.selectedAddress);
            setConnected(true);
          }
          ethereum.on("chainChanged", (chainId) => {
            checkNetwork();
          });
        }
      } else {
        errorAlertCenter(SITE_ERROR[1]);
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Head>
        <title>Test Staking</title>
        <meta name="description" content="Test Staking" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Header
          signerAddress={signerAddress}
          connectWallet={() => connectWallet()}
          connected={connected}
        />
        <div className="top-title">
          <Container maxWidth="lg">
            <h1 className="title">Stake Your NFT</h1>
          </Container>
        </div>
        {connected && (
          <Container>
            <div className="main-page">
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <div className="nft-box">
                    <div className="box-header">
                      <h3>
                        Your NFT{" "}
                        {unstakedNFTs?.length && `(${unstakedNFTs?.length})`}
                      </h3>
                      <div className="box-control">
                        <button
                          className="btn-second"
                          onClick={onStakeAll}
                          disabled={stakeAllLoading}
                        >
                          {stakeAllLoading ? (
                            <div className="btn-loading">
                              <PageLoading />
                            </div>
                          ) : (
                            <>STAKE ALL</>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="box">
                      {loading ? (
                        <PageLoading />
                      ) : (
                        <div className="box-content">
                          {unstakedNFTs &&
                            unstakedNFTs.length !== 0 &&
                            unstakedNFTs.map((item, key) => (
                              <NFTCard
                                id={item.id}
                                key={key}
                                tokenId={item.tokenId}
                                signerAddress={signerAddress}
                                updatePage={() => updatePage(signerAddress)}
                                contract={contract}
                                contract_nft={contract_nft}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <div className="nft-box">
                    <div className="box-header">
                      <h3>
                        Staked NFT{" "}
                        {stakedNFTs?.length && `(${stakedNFTs?.length})`}
                      </h3>
                      <div className="box-control">
                        <button
                          className="btn-second"
                          onClick={() => handleOpen(1, stakedNFTs)}
                          disabled={unstakeAllLoading}
                        >
                          {unstakeAllLoading ? (
                            <div className="btn-loading">
                              <PageLoading />
                            </div>
                          ) : (
                            <>UNSTAKE ALL</>
                          )}
                        </button>

                        <button
                          className="btn-second"
                          onClick={() => handleOpen(0, stakedNFTs)}
                          disabled={claimAllLoading}
                        >
                          {claimAllLoading ? (
                            <div className="btn-loading">
                              <PageLoading />
                            </div>
                          ) : (
                            <>CLAIM ALL</>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="box">
                      {loading ? (
                        <PageLoading />
                      ) : (
                        <div className="box-content">
                          {stakedNFTs &&
                            stakedNFTs.length !== 0 &&
                            stakedNFTs.map((item, key) => (
                              <UnNFTCard
                                key={key}
                                id={item.id}
                                tokenId={item.tokenId}
                                signerAddress={signerAddress}
                                updatePage={() => updatePage(signerAddress)}
                                contract={contract}
                                contract_nft={contract_nft}
                                setResponse={setResponse}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Grid>
              </Grid>
            </div>
          </Container>
        )}
        {gameModalOpen && <TicTacToeModal />}
      </main>
      {/* eslint-disable-next-line */}
      <img src="/kongbackground.gif" className="background" alt="" />
    </>
  );
}
