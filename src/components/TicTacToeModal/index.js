import React, { useEffect, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import axios from "axios";

import style  from "./index.module.css"
import { BACKEND_URL } from "../../../config";

const PLAYER_HUMAN = 'X';
const PLAYER_COMPUTER = 'O';

export default function TicTacToeModal() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerXNext, setIsPlayerXNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const { tokens, release, signer, setGameModalOpen } = useApp();

  const handleSend = () => {
    const tokenIds = tokens;
    
    console.log("TOKEN IDS:", tokenIds);
    console.log("Release: ", release);
    
    const url = BACKEND_URL;

    const requestBody = {
        address: signer,
        release: release.toString(),
        tokenIds: JSON.stringify({"ids": tokenIds})
    }

    axios.post(url, requestBody)
    .then(response => {
        console.log('Response: ', response.data)
    })
    .catch(error => {
        console.error('Error: ', error)
    });

    setGameModalOpen(false)
  } 

  useEffect(() => {
    if (!isPlayerXNext) {
      // Computer's turn
      const randomMove = getRandomMove(board);
      makeMove(randomMove);
    }
  }, [isPlayerXNext, board]);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const isBoardFull = (squares) => {
    return squares.every((square) => square !== null);
  };

  const handleClick = (i) => {
    if (winner || board[i]) return;
    if (isPlayerXNext) {
      makeMove(i, PLAYER_HUMAN);
    }
  };

  const makeMove = (i, player = PLAYER_COMPUTER) => {
    const newBoard = [...board];
    newBoard[i] = player;
    setBoard(newBoard);
    setIsPlayerXNext(!isPlayerXNext);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner || isBoardFull(newBoard)) {
      setWinner(gameWinner);
    }
  };

  const getRandomMove = (squares) => {
    const emptySquares = squares
      .map((value, index) => (value === null ? index : null))
      .filter((index) => index !== null);
    const randomIndex = Math.floor(Math.random() * emptySquares.length);
    return emptySquares[randomIndex];
  };

  const renderSquare = (i) => (
    <button className={style.square} onClick={() => handleClick(i)}>
      {board[i]}
    </button>
  );

  const getStatus = () => {
    if (winner) {
      if (winner == PLAYER_HUMAN) {
        return `Winner: You`;
      } else {
        return `Winner: Computer`;
      }
    } else if (isBoardFull(board)) {
      return 'It\'s a draw!';
    } else {
      return `Next player: ${isPlayerXNext ? PLAYER_HUMAN : PLAYER_COMPUTER}`;
    }
  };
  return (
    <div className={style.game}>
      <div className={style.gameModal}>
        <button
          className={style.closeButton}
          onClick={() => setGameModalOpen((prev) => !prev)}
        >
          Close
        </button>
        <br/>
        
        <div className={style.intern}>
          <div className={style.status}>{getStatus()}</div>

          <div className={style.boardrow}>
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </div>
          <div className={style.boardrow}>
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </div>
          <div className={style.boardrow}>
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
          </div>
          {winner == PLAYER_HUMAN 
            ?
            <div>
              You Are Winner. You can Claim now.
              <br/>
              <button onClick={()=> handleSend()}>Claim</button>
            </div> 
            : 
            <>
              You Lose. You can&apos;t Claim now.
            </>
            }
        </div>
      </div>
  );
}
