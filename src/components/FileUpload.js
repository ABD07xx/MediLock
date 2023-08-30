import { useState } from "react";
import axios from "axios";
import { ipofserver } from '../global';
import "./FileUpload.css";

async function uploadImageToServer(blob, contract, account, provider) {

  const visual_as_file = new File([blob], "imagefile.jpg", {
    type: 'image/jpg'
  });

  console.log(visual_as_file);
  // const formDataqq = new FormData();

  // formDataqq.append('File', visual_as_file);

  // axios.post(ipofserver + 'uploadFile1', formDataqq)
  // .then(function (response) {
  //   alert(response.data)
  // })
  // .catch(function (error) {
  //   return error;
  // });

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
        "Content-Type": "multipart/form-data",
      },
    });
    const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
    alert("Done "+ImgHash)
    //const signer = contract.connect(provider.getSigner());
    const signer = contract.connect(provider.getSigner());
    signer.add(account, ImgHash);
    alert("Successfully Image Uploaded");
  } catch (e) {
    console.log(e)
    alert("Unable to upload image to Pinata");
  }

};

const FileUpload = ({ contract, account, provider }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No image selected");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {

      const formData1 = new FormData();

      formData1.append('File', file);
      formData1.append('watermark', 'Signed by ' + account + ' address.');
      formData1.append("account_id", account);

      axios.post(ipofserver + 'uploadFile', formData1)
        .then(async function (response11) {
          if (response11.data === 'success') {
            try {
              fetch(ipofserver + 'get-cut-image')
                .then((response) => response.blob())
                .then((blob) => uploadImageToServer(blob, contract, account, provider))
                .catch((error) => console.error('Error fetching image:', error));
              // setTimeout( function() { uploadImageToServer(blob)}, 3000);
              // uploadImageToServer(blob);
            } catch (e) {
              console.log(e)
              alert("Unable to upload image to Pinata ");
            }

          }
          else {
            alert("QR not generated");
          }
        })
        .catch(function (error) {
          return error;
        });

    }
    // alert("Successfully Image Uploaded");
    // setFileName("No image selected");
    // setFile(null);
  };
  const retrieveFile = (e) => {
    const data = e.target.files[0]; //files array of files object
    console.log(data);
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
      </form>
    </div>
  );
};
export default FileUpload;
