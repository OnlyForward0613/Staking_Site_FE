import { useEffect, useState } from "react";
import { ScaleLoader } from "react-spinners";
import { successAlert } from "./toastGroup";
import { PageLoading } from "./Loading";
import { useApp } from "../contexts/AppContext";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function UnNFTCard({
  id,
  nftName,
  tokenId,
  signerAddress,
  updatePage,
  contract,
  contract_nft,
  setResponse
}) {
  const {setGameModalOpen, setSigner, setRelease, setTokens} = useApp()
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [reward, setReward] = useState(0);


  const handleOpen = (release, tokenId) => {
    let tokenIds = [];
    tokenIds.push(tokenId);

    setSigner(signerAddress);
    setRelease(release);
    setTokens(tokenIds);
    setGameModalOpen(true);
  };

  const getNftDetail = async () => {
    const uri = await contract_nft?.tokenURI(tokenId);
    await fetch(uri)
      .then((resp) => resp.json())
      .catch((e) => {
        console.log(e);
      })
      .then((json) => {
        setImage(json?.image);
      });
  };

  const getReward = async () => {
    const reward =
      parseFloat(await contract.rewardAmount(tokenId)) / Math.pow(10, 18);
    setReward(reward);
  };

  const showReward = () => {
    getReward();
    setInterval(() => {
      getReward();
    }, 10000);
  };

  useEffect(() => {
    getNftDetail();
    showReward();
    // eslint-disable-next-line
  }, []);
  return (
    <div className="nft-card">
      <div className="reward">
        <p>Reward:</p>
        <span>{parseFloat(reward).toLocaleString()} USDT</span>
      </div>
      {loading && (
        <div className="card-loading">
          <PageLoading />
        </div>
      )}
      <div className="media">
        {image === "" ? (
          <span className="empty-image empty-image-skeleton"></span>
        ) : (
          // eslint-disable-next-line
          <img src={image} alt="" style={{ opacity: loading ? 0 : 1 }} />
        )}
      </div>
      <div className={loading ? "card-action is-loading" : "card-action"}>
        <button className="btn-primary" onClick={()=>handleOpen(1, tokenId)}>
          UNSTAKE
        </button>
       
        <button className="btn-primary" onClick={()=>handleOpen(0, tokenId)}>
          CLAIM
        </button>
      </div>
    </div>
  );
}
//after
