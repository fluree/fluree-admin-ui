import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function NetworkScreenCard({ value, name, tooltipText = "" }) {
  return (
    <div
      id="network-screen-card"
      style={{
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#fff",
        height: "100%",
      }}
    >
      {tooltipText ? (
        <OverlayTrigger
          placement={"top"}
          overlay={
            <Tooltip
              style={{
                maxWidth: "auto",
                textAlign: "left",
              }}
            >
              {tooltipText}
            </Tooltip>
          }
        >
          <p
            style={{ cursor: "pointer", color: "#091133", textAlign: "center" }}
          >
            {name}
          </p>
        </OverlayTrigger>
      ) : (
        <p style={{ color: "#091133", textAlign: "center" }}>{name}</p>
      )}
      <p
        style={{
          textAlign: "center",
          color: "#13c6ff",
          fontWeight: "bold",
          paddingTop: "10px",
        }}
      >
        {value}
      </p>
    </div>
  );
}
