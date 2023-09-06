import { ToastContainer } from "react-toastify";
import "../styles/globals.css";
import "../styles/style.scss";
import { AppProvider } from "../contexts/AppContext";

function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <ToastContainer
        style={{ fontSize: 14, padding: "5px !important", lineHeight: "15px" }}
      />
      <Component {...pageProps} />
    </AppProvider>
  );
}

export default MyApp;
