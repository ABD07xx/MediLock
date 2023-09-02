import { useState } from "react";
import "./Display.css";
import axios, { formToJSON } from "axios";
import { ipofserver } from "../global";

const Display = ({ contract, account }) => {
  const [data, setData] = useState("");
  
  
  const getdata = async () => {
    let dataArray;
    const Otheraddress = document.querySelector(".address").value;
    try {
        if (Otheraddress) {
            dataArray = await contract.display(Otheraddress);
            console.log("dataArray:", dataArray);
        } else {
            dataArray = await contract.display(account);
        }
    } catch (e) {
        alert("You don't have access");
        return;
    }

    const isEmpty = Object.keys(dataArray).length === 0;

    if (!isEmpty) {
        const str = dataArray.toString();
        const str_array = str.split(",");
        console.log("str:", str);
        console.log("str_array:", str_array);

        const images = [];

        for (let i = 0; i < str_array.length; i++) {
            const item = str_array[i];
            const encryptedImageUrl = `https://ipfs.io/ipfs${item.substring(6)}`;
            console.log("encryptedImageUrl:", encryptedImageUrl);

            try {
                // Fetch the encrypted image data from the IPFS URL
                const encryptedImageResponse = await axios.get(encryptedImageUrl, { responseType: 'arraybuffer' });
                const encryptedImageData = new Blob([new Uint8Array(encryptedImageResponse.data)], { type: 'image/jpeg' });


                console.log(encryptedImageData);
                // Send the fetched data to the server for decryption
                const formData = new FormData();
                formData.append('encryptedFile', encryptedImageData);
              
                const response = await axios.post(ipofserver + "/decryptFile", formData);
                const base64Image = response.data.image;
                const decryptedImageUrl = `data:image/jpeg;base64,${base64Image}`;
                console.log("Decrypted: ",decryptedImageUrl);
                
                images.push(
                  <a
                      href={decryptedImageUrl}
                      key={i}
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                      <img
                          src={decryptedImageUrl}
                          alt="new"
                          className="image-list"
                      />
                  </a>
              );
            } catch (error) {
                console.error("Error decrypting image:", error);
            }
        }

        setData(images);
    } else {
        alert("No image to display");
    }
};


  return (
    <>
      <div className="image-list">{data}</div>
      <input
        type="text"
        placeholder="Enter Account Address"
        className="address"
      ></input>
      <button className="center button" onClick={getdata}>
        Get Data
      </button>
    </>
  );
};
export default Display;