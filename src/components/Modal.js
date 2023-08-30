import React, { useState, useEffect } from "react";
import "./Modal.css";


const Modal = ({ setModalOpen, contract, userAddress }) => {
  console.log("User Address from App.js:", userAddress);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageUrls, setImageUrls] = useState([]);

  const sharing = async () => {
    const address = document.querySelector(".address").value;
    await contract.allow(address);
    setModalOpen(false);
  };

  const revokeAccess = async () => {
    const address = document.querySelector(".address").value;
    await contract.disallow(address);
    setModalOpen(false);
  };

  //*-------------------------------------------------------------------------------------------------------*//
  const shareSelectedImage = async () => {
    console.log(contract);
    const address = document.querySelector(".address").value; // Use the user address from App.js
      if (address && selectedImage) {
        
        console.log(userAddress,address,selectedImage);
        await contract.shareImage(address, selectedImage); // Share the selected image with the specified address
        setModalOpen(false);
      } else {
        alert("Please enter an address and select an image to share.");
      }

  };

  //*------------------------------------------------------------------------------------------------------*//

  const handleImageSelect = (event) => {
    setSelectedImage(event.target.value);
  };

  useEffect(() => {
    const accessList = async () => {
      const addressList = await contract.shareAccess();
      let select = document.querySelector("#selectNumber");
      const options = addressList;
  
      for (let i = 0; i < options.length; i++) {
        let opt = options[i];
        let e1 = document.createElement("option");
        e1.textContent = opt;
        e1.value = opt;
        select.appendChild(e1);
      }
    };
    contract && accessList();
  
    const getImageUrls = async (selectedAddress) => {
      if (selectedAddress) {
        
        const fetchedImageUrls = await contract.display(selectedAddress);
        setImageUrls(fetchedImageUrls);
        setSelectedImage(""); // Reset selected image when address changes
      }
    };
  
    getImageUrls(userAddress); // Fetch image URLs using the userAddress
  }, [contract, userAddress]);
  return (
    <>
      <div className="modalBackground">
        <div className="modalContainer">
          <div className="title">Share with</div>
          <div className="body">
            <input
              type="text"
              className="address"
              placeholder="Enter Address"
            ></input>
          </div>
          <form id="myForm">
            <select id="selectNumber">
              <option className="address">People With Access</option>
            </select>
          </form>
          <div className="imagesel">
            <select
              id="imageUrlsSelect"
              onChange={handleImageSelect}
              value={selectedImage}
            >
              <option value="">Select an image</option>
              {imageUrls.map((url, index) => (
                <option key={index} value={url}>
                  {url}
                </option>
              ))}
            </select>
          </div>
          <div className="footers">
            <button
              onClick={() => {
                setModalOpen(false);
              }}
              id="cancelBtn"
            >
              Cancel
            </button>
            <button onClick={() => sharing()}>Share All</button>
            <button onClick={() => revokeAccess()}>Revoke</button>
            <button onClick={() => shareSelectedImage()}>Share Image</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
