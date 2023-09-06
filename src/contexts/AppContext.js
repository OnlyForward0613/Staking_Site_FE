import {createContext, useContext, useState} from "react"

export const AppContext = createContext({
  gameModalOpen: false,
  setGameModalOpen: () => {},
  release: 0,
  setRelease: () => {},
  tokens: [],
  setTokens: () => {},
  signer: "",
  setSigner: () => {}
});

export const AppProvider = ({ children }) => {
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [release, setRelease] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [signer, setSigner] = useState("");
  return (
    <AppContext.Provider
      value={{
        gameModalOpen,
        setGameModalOpen,
        release,
        setRelease,
        tokens,
        setTokens,
        signer,
        setSigner
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  return useContext(AppContext);
};