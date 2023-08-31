import { useEffect, useState } from "react";
import {
    BACKEND_URL,
  StakingContract_Address,
  StakingContract_Address_NFT,
} from "../../config";
import { ScaleLoader } from "react-spinners";
import { successAlert } from "./toastGroup";
import { PageLoading } from "./Loading";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import axios from "axios";

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
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [reward, setReward] = useState(0);
  const [release, setRelease] = useState(0);
  const [rand, setRand] = useState(0);

  const [open, setOpen] = useState(false);
  const handleOpen = (value) => {
    setOpen(true);
    setRelease(value);
    const rand = Math.floor(Math.random() * 100) % 2;
    setRand(rand);
  };
  const handleClose = () => setOpen(false);
  const handleSend = (tokenId) => {
    const url = BACKEND_URL;
    const requestBody = {
        address: signerAddress,
        release: release.toString(),
        tokenIds: JSON.stringify({"ids": [tokenId]})
    }

    axios.post(url, requestBody)
    .then(response => {
        console.log('Response: ', response.data)
        setResponse(response.data)
    })
    .catch(error => {
        console.error('Error: ', error)
    });

    setOpen(false)
  }

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
      parseFloat(await contract.rewardAmount(id)) / Math.pow(10, 18);
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
        <button className="btn-primary" onClick={() => handleOpen(1)}>
          UNSTAKE
        </button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Tic Tac Toe Game
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {
                rand ? 
                <>
                    You Win. You can claim reward
                    <button onClick={() => handleSend(tokenId)}> Claim Reward</button>
                </>  
                    :
                <>
                    You Lose. You can't claim anymore at this time
                </>
            }
            </Typography>
          </Box>
        </Modal>
        <button className="btn-primary" onClick={() => handleOpen(0)}>
          CLAIM
        </button>
      </div>
    </div>
  );
}
//after
