
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

function TicketScanner() {
  const [result, setResult] = useState("");
  const [status, setStatus] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        await scanner.clear();
        setLoading(true);

        try {
          const token = localStorage.getItem("eventra_token");

          const response = await axios.post(
            "http://localhost:5000/api/tickets/verify",
            { ticketCode: decodedText },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setResult(response.data.message);
          setStatus("success");
        } catch (error: any) {
          setResult(
            error.response?.data?.message ||
              "Ticket verification failed."
          );
          setStatus("error");
        } finally {
          setLoading(false);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scannerKey]);

  const scanAgain = () => {
    setResult("");
    setStatus("");
    setScannerKey((prev) => prev + 1);
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "60px auto",
        padding: "30px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#20213e", fontSize: "38px" }}>
        Eventra Ticket Scanner
      </h1>

      <p style={{ color: "#777", fontSize: "17px" }}>
        Scan an attendee's QR code to verify their ticket.
      </p>

      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          marginTop: "25px",
        }}
      >
        {!result && !loading && (
          <>
            <h3>Position the QR code inside the scanner</h3>
            <div id="qr-reader"></div>
          </>
        )}

        {loading && <h3>Verifying ticket...</h3>}

        {result && (
          <div
            style={{
              padding: "25px",
              borderRadius: "12px",
              background: status === "success" ? "#e8f8ef" : "#fdecec",
              color: status === "success" ? "#168344" : "#c62828",
            }}
          >
            <h2>
              {status === "success"
                ? "✓ Ticket Verified!"
                : "✕ Verification Failed"}
            </h2>

            <p style={{ fontSize: "17px" }}>{result}</p>

            <button
              onClick={scanAgain}
              style={{
                background: "#6754df",
                color: "white",
                border: "none",
                padding: "13px 25px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "15px",
                marginTop: "15px",
              }}
            >
              Scan Next Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketScanner;
