import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import PhoneCall from "../../../features/room-page/icons/PhoneCall";
import HangUpPhone from "../../../features/room-page/icons/HangUp";
import { TrackContext, WebRTCEndpoint } from "@jellyfish-dev/membrane-webrtc-js";
import { neutralButtonStyle, redButtonStyle } from "../../../features/room-page/consts";

Modal.setAppElement("#root"); // In most cases, you would use '#root'

const CallButton = ({ webrtc }: { webrtc: WebRTCEndpoint | undefined }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    webrtc?.on("trackAdded", (ctx: TrackContext) => {
      if (ctx.endpoint.type == "sip") setInCall(true);
    });
    webrtc?.on("trackRemoved", (ctx: TrackContext) => {
      if (ctx.endpoint.type == "sip") setInCall(false);
    });
  }, [webrtc]);

  const handleButtonClick = () => {
    if (inCall) {
      const mediaEvent = { type: "SIP-Event", msg: "disconnect" };
      webrtc?.emit("sendMediaEvent", JSON.stringify(mediaEvent));
      setInCall(false);
    } else {
      setModalIsOpen(true);
    }
  };

  const handleSubmit = () => {
    const mediaEvent = { type: "SIP-Event", phoneNumber: phoneNumber };
    webrtc?.emit("sendMediaEvent", JSON.stringify(mediaEvent));
    setModalIsOpen(false);
    setInCall(true);
  };

  const customModalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#f4f4f4",
      borderRadius: "10px",
      padding: "20px",
    },
  };

  const customInputStyles: React.CSSProperties = {
    width: "100%",
    padding: "12px 20px",
    margin: "8px 0",
    boxSizing: "border-box",
    borderRadius: "4px",
  };

  const customButtonStyles: React.CSSProperties = {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "15px 32px",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "16px",
    margin: "4px 2px",
    borderRadius: "4px",
    cursor: "pointer",
  };

  return (
    <>
      <button id="phone-call" className={inCall ? redButtonStyle : neutralButtonStyle} onClick={handleButtonClick}>
        {inCall ? (
          <>
            <HangUpPhone /> Hangup phone{" "}
          </>
        ) : (
          <>
            <PhoneCall /> Call phone
          </>
        )}
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Phone Number Modal"
        style={customModalStyles}
      >
        <h2>Enter the Phone Number</h2>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={customInputStyles}
        />
        <button style={customButtonStyles} onClick={handleSubmit}>
          Submit
        </button>
        <button onClick={() => setModalIsOpen(false)}>Close</button>
      </Modal>
    </>
  );
};

export default CallButton;
