import React, { useState } from "react";
import axios from "axios";
import { ipofserver } from "../global";
import "./FileUpload2.css";
import Modal from "react-modal";

async function uploadImageToServer(blob, contract, account, provider, setUploadProgress) {
  const visual_as_file = new File([blob], "EncryptedImageFile.jpg", {
    type: "image/jpg"
  });

  const formData = new FormData();
  formData.append("file", visual_as_file);

  try {
    const resFile = await axios({
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data: formData,
      headers: {
        pinata_api_key: `64a21e90830e7435b3da`,
        pinata_secret_api_key: `6f33592c21da0c26416f30277c81f3496a2bb97aa605de9150d26825082a9dc8`,
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setUploadProgress(progress);
      }
    });

    const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
    const signer = contract.connect(provider.getSigner());
    await signer.add(account, ImgHash);
  } catch (e) {
    console.log(e);
  }
}

const FileUpload = ({ contract, account, provider }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No image selected");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [waitingForTransaction, setWaitingForTransaction] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      setModalIsOpen(true);

      const formData1 = new FormData();
      formData1.append("File", file);
      formData1.append("watermark", "Signed by " + account + " address.");
      formData1.append("account_id", account);

      axios
        .post(ipofserver + "uploadFile", formData1)
        .then(async function (response11) {
          if (response11.data === "success") {
            try {
              setWaitingForTransaction(true);
              const blob = await fetch(ipofserver + "get-cut-image").then((response) =>
                response.blob()
              );
              await uploadImageToServer(blob, contract, account, provider, setUploadProgress);
            } catch (e) {
              console.log(e);
            } finally {
              setWaitingForTransaction(false);
            }
          } else {
            alert("QR not generated");
          }
        })
        .catch(function (error) {
          console.error(error);
        })
        .finally(() => {
          setModalIsOpen(false);
        });
    }
  };

  const retrieveFile = (e) => {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      setFile(e.target.files[0]);
    };
    setFileName(e.target.files[0].name);
    e.preventDefault();
  };

  return (
    <div className="top">
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="file-upload" className="choose">
          Choose Image
        </label>
        <input
          disabled={!account}
          type="file"
          id="file-upload"
          name="data"
          onChange={retrieveFile}
        />
        <span className="textArea">Image: {fileName}</span>
        <button type="submit" className="upload" disabled={!file}>
          Upload File
        </button>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel="File Upload Progress"
          className="modal"
        >
          <div className="modal-content">
            <h2>Uploading EMR</h2>
            {waitingForTransaction ? (
              <p>Waiting for Secure Blockchain Transaction</p>
            ) : (
              <p>Progress: {uploadProgress}%</p>
            )}
          </div>
        </Modal>
      </form>
    </div>
  );
};

export default FileUpload;
