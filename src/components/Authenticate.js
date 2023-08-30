import React, { useState } from 'react';
import Modal from 'react-modal';
import { SHA256 } from 'crypto-js';
import './Authenticate.css'; // Import the provided CSS

const AuthenticationModal = ({ isOpen, onRequestClose, onAuthenticate, accountId, contract }) => {
  const [typedAccountId, setTypedAccountId] = useState('');
  const [authenticationResult, setAuthenticationResult] = useState(null);
  const [showVerificationAnimation, setShowVerificationAnimation] = useState(false);

  const handleAccountIdChange = (e) => {
    setTypedAccountId(e.target.value);
  };

  const handleAuthenticate = async () => {
    try {
      // Check if the contract is initialized
      if (!contract) {
        console.error('Contract not initialized');
        return;
      }

      // Fetch the stored SHA from the blockchain for the entered sender's address
      const storedSHA = await contract.accountToSHA(typedAccountId);

      // Calculate the SHA using the sender's address
      const secretKey = SHA256(typedAccountId).toString();
      const calculatedSHA = SHA256(typedAccountId + secretKey).toString();

      setShowVerificationAnimation(true); // Show verification animation
      

      setTimeout(() => {
        if (calculatedSHA === storedSHA && typedAccountId === document.querySelector(".address").value) {
          setAuthenticationResult("success");
          onAuthenticate(typedAccountId);
        } else {
          setAuthenticationResult("failure");
        }
        setShowVerificationAnimation(false); // Hide verification animation
      }, 4000); // Delay for 4 seconds
    } catch (error) {
      console.error("Error fetching data from contract:", error);
      setAuthenticationResult("failure");
      setShowVerificationAnimation(false); // Hide verification animation
    }
  };
  const handleCancel = () => {
    setTypedAccountId(''); // Clear the input field
    setAuthenticationResult(null);
    setShowVerificationAnimation(false);
    onRequestClose(); // Close the modal
  };
return (
  
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Authentication Modal"
    className="modal-container"
  >
    <h2>Authentication</h2>
    <label>
      Account ID:
      <input type="text" value={typedAccountId} onChange={handleAccountIdChange} />
    </label>
    <button onClick={handleAuthenticate}>Authenticate</button>
    <button onClick={handleCancel}>Cancel</button> 
    
    {/* Show verification animation */}
    {showVerificationAnimation && (
      <p className="verify-animation">Verifying SHA Hash...</p>
    )}

    {/* Show verified account animation */}
    {authenticationResult === "success" && !showVerificationAnimation && (
      <div className="verified-animation">
        {/* SVG for the verified account animation */}
        <svg
          className="checkmark"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
          
        >
          <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
          <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>
    )}
    
    {/* Show failure icon */}
    {authenticationResult === "failure" && !showVerificationAnimation && (
              <div className={`failure-icon fade-in`}>
              {/* SVG for the smaller failure icon */}
              <svg
                className="cross"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
                width="130"  // Adjust the width to make it smaller
                height="130" // Adjust the height to make it smaller
              >
                <path className="cross__path" fill="none" d="M16 16 36 36 M36 16 16 36" />
              </svg>
            </div>
    
    )}
  </Modal>
);
};

export default AuthenticationModal;
