import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import SHA256 from 'crypto-js/sha256';  // Import SHA256
import Upload from "./components/Upload.json";
import FileUpload from "./components/FileUpload1";
import Display from "./components/Display";
import Modal from "./components/Modal";
import AuthenticationModal from "./components/Authenticate"; 
import "./App.css";
import ReactModal from "react-modal"; 

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const loadProvider = async () => {
      if (provider) {
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });

        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        let contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const contractInstance = new ethers.Contract(
          contractAddress,
          Upload.abi,
          signer
        );
        setContract(contractInstance);
        setProvider(provider);

        // Check if the SHA hash already exists for this account
        const doesSHAExist = await contractInstance.doesSHAExist(address);
        
        // If it doesn't exist, calculate and save the SHA hash
        if (!doesSHAExist) {
          const secretKey = SHA256(address).toString();
          const hash = SHA256(address + secretKey).toString();
          await contractInstance.saveSHA(hash);
          console.log("SHA saved in Bchain",hash);
        }
      } else {
        console.error("Metamask is not installed");
      }
    };

    provider && loadProvider();
  }, []);
  const handleAuthentication = (authenticatedAccountId) => {
    console.log("Authenticated account ID:", authenticatedAccountId);
    // Additional actions can be taken here
  };

  return (
    <>
      <div className="button-container">
        <button className="share-button" onClick={() => setModalOpen(true)}>
          EMR Share Options
        </button>

        <button className="authentication-button" onClick={() => setAuthModalOpen(true)}>
          Authentication
        </button>
      </div>

      {contract && (
          <AuthenticationModal
            isOpen={authModalOpen}
            onAuthenticate={handleAuthentication}
            onRequestClose={() => setAuthModalOpen(false)}
            contract={contract}
          />
        )}

       
      {modalOpen && (
        <Modal setModalOpen={setModalOpen} contract={contract} userAddress={account} />
      )}
      <div className="App">
        <h1 style={{ color: "#6222cc" }}>Medical Report Vault</h1>
        <div className="bg"></div>
        <div className="bg bg2"></div>
        <div className="bg bg3"></div>
        <p style={{ color: "#6222cc" }}>
          Account : {account ? account : "Not connected"}
        </p>
        <FileUpload
          account={account}
          provider={provider}
          contract={contract}
        ></FileUpload>
        <Display contract={contract} account={account}></Display>
      </div>
    </>
  );
}


ReactModal.setAppElement("#root");

export default App;
