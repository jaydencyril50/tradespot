import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f7fa",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start"
    }}>
      <div style={{
        width: "100%",
        border: "1.5px solid #222",
        background: "#fff",
        marginBottom: "0",
        marginTop: "0",
        boxSizing: "border-box"
      }}>
        <h1 style={{
          textAlign: "center",
          fontWeight: "bold",
          letterSpacing: "0.08em",
          fontSize: "2rem",
          margin: "16px 0 10px 0",
          fontFamily: "serif"
        }}>
          TRADESPOT
        </h1>
      </div>
      <div style={{
        background: "#fff",
        marginTop: "20px",
        boxShadow: "0 6px 32px 0 #0005, 0 3px 12px 0 #0002",
        padding: "22px 18px 18px 18px",
        maxWidth: "340px",
        width: "100%",
        textAlign: "center",
        border: "1px solid #e0e3e8"
      }}>
        <h2 style={{
          fontWeight: "bold",
          color: "#1a2233",
          fontSize: "1rem",
          marginBottom: "10px",
          fontFamily: "serif"
        }}>
          Empowering Your Crypto Journey
        </h2>
        <p style={{
          color: "#444",
          fontSize: "0.95rem",
          marginBottom: "18px",
          lineHeight: "1.5"
        }}>
          TradeSpot is the all-in-one platform for secure, automated, and intelligent crypto investing.
          Seamlessly onboard, deposit, and let our AI-driven engine and expert team grow your capital.
          Enjoy instant transfers, transparent profits, and 24/7 support—all under strict security and admin oversight.
          Experience the future of digital wealth management.
        </p>
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px"
        }}>
          <button
            style={{
              background: "#888",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "0.95rem",
              border: "none",
              borderRadius: "3px",
              padding: "8px 18px",
              cursor: "pointer",
              minWidth: "80px"
            }}
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
          <button
            style={{
              background: "#888",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "0.95rem",
              border: "none",
              borderRadius: "3px",
              padding: "8px 18px",
              cursor: "pointer",
              minWidth: "80px"
            }}
            onClick={() => {
              const token = localStorage.getItem("token");
              if (token) {
                navigate("/dashboard");
              } else {
                navigate("/login");
              }
            }}
          >
            Dashboard
          </button>
          <button
            style={{
              background: "#888",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "0.95rem",
              border: "none",
              borderRadius: "3px",
              padding: "8px 18px",
              cursor: "pointer",
              minWidth: "80px"
            }}
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </div>
      </div>
      {/* Feature Cards */}
      <div style={{
        marginTop: "32px",
        width: "100%",
        maxWidth: "540px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "0 12px",
        boxSizing: "border-box"
      }}>
        {/* Card 1 */}
        <div style={{
          background: "#fff",
          boxShadow: "0 8px 32px 0 #0004, 0 3px 12px 0 #0002",
          padding: "18px 12px 14px 12px",
          textAlign: "center",
          border: "1px solid #e0e3e8",
          minHeight: "110px"
        }}>
          <div style={{ fontSize: "2.0rem", marginBottom: "10px" }}>🔒</div>
          <div style={{ fontWeight: 650, fontSize: "1.0rem", marginBottom: "8px", color: "#1a2233", fontFamily: "serif" }}>
            Secure Onboarding
          </div>
          <div style={{ color: "#444", fontSize: "1.0rem" }}>
            SPOT ID face verification and personal wallet for every user.
          </div>
        </div>
        {/* Card 2 */}
        <div style={{
          background: "#fff",
          boxShadow: "0 8px 32px 0 #0004, 0 3px 12px 0 #0002",
          padding: "18px 12px 14px 12px",
          textAlign: "center",
          border: "1px solid #e0e3e8",
          minHeight: "110px"
        }}>
          <div style={{ fontSize: "2.0rem", marginBottom: "10px" }}>🤖</div>
          <div style={{ fontWeight: 650, fontSize: "1.0rem", marginBottom: "8px", color: "#1a2233", fontFamily: "serif" }}>
            AI-Powered Trading
          </div>
          <div style={{ color: "#444", fontSize: "1.0rem" }}>
            Automated bots and human experts maximize your returns, hands-free.
          </div>
        </div>
        {/* Card 3 */}
        <div style={{
          background: "#fff",
          boxShadow: "0 8px 32px 0 #0004, 0 3px 12px 0 #0002",
          padding: "18px 12px 14px 12px",
          textAlign: "center",
          border: "1px solid #e0e3e8",
          minHeight: "110px"
        }}>
          <div style={{ fontSize: "2.0rem", marginBottom: "10px" }}>⚡</div>
          <div style={{ fontWeight: 650, fontSize: "1.0rem", marginBottom: "8px", color: "#1a2233", fontFamily: "serif" }}>
            Instant Transfers
          </div>
          <div style={{ color: "#444", fontSize: "1.0rem" }}>
            Send funds instantly to other users with zero blockchain fees.
          </div>
        </div>
      </div>
      {/* End Feature Cards */}
      {/* Extra Feature Section */}
      <div style={{
        marginTop: "32px",
        width: "100%",
        maxWidth: "540px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "0 12px",
        boxSizing: "border-box"
      }}>
        {/* 24/7 AI Support */}
        <div style={{
          background: "#fff",
          boxShadow: "0 8px 32px 0 #0004, 0 3px 12px 0 #0002",
          padding: "18px 12px 14px 12px",
          textAlign: "center",
          border: "1px solid #e0e3e8",
          minHeight: "110px"
        }}>
          <div style={{ fontSize: "2.0rem", marginBottom: "10px" }}>
            <span role="img" aria-label="AI Support" style={{ color: "#ff4fcf" }}>🧠</span>
          </div>
          <div style={{
            fontWeight: 650,
            fontSize: "1.0rem",
            marginBottom: "8px",
            color: "#1a2233",
            fontFamily: "serif"
          }}>
            24/7 AI Support
          </div>
          <div style={{ color: "#444", fontSize: "1.0rem" }}>
            Get help anytime from our SuperAI Bot and join the Social Hub.
          </div>
        </div>
        {/* Full Transparency */}
        <div style={{
          background: "#fff",
          boxShadow: "0 8px 32px 0 #0004, 0 3px 12px 0 #0002",
          padding: "18px 12px 14px 12px",
          textAlign: "center",
          border: "1px solid #e0e3e8",
          minHeight: "110px"
        }}>
          <div style={{ fontSize: "2.0rem", marginBottom: "10px" }}>
            <span role="img" aria-label="Transparency" style={{ color: "#2196f3" }}>🛡️</span>
          </div>
          <div style={{
            fontWeight: 650,
            fontSize: "1.0rem",
            marginBottom: "8px",
            color: "#1a2233",
            fontFamily: "serif"
          }}>
            Full Transparency
          </div>
          <div style={{ color: "#444", fontSize: "1.0rem" }}>
            Admin oversight, real-time logs, and secure withdrawals for peace of mind.
          </div>
        </div>
      </div>
      {/* End Extra Feature Section */}
      {/* Fast & Secure Withdrawals */}
      <div style={{
        marginTop: "32px",
        width: "100%",
        maxWidth: "700px",
        padding: "0 12px",
        boxSizing: "border-box",
        marginBottom: "48px"
      }}>
        <div style={{
          background: "#fff",
          boxShadow: "0 12px 48px 0 #0006, 0 4px 16px 0 #0003",
          padding: "18px 12px 28px 12px",
          textAlign: "center",
          border: "1px solid #e0e3e8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "110px"
        }}>
          <div style={{
            fontSize: "2.0rem",
            marginBottom: "4px",
            marginTop: "0"
          }}>
            <span role="img" aria-label="Money" style={{ fontSize: "2.0rem" }}>💵</span>
          </div>
          <div style={{
            fontWeight: 650,
            fontSize: "1.0rem",
            marginBottom: "8px",
            color: "#1a2233",
            fontFamily: "serif"
          }}>
            Fast &amp; Secure Withdrawals
          </div>
          <div style={{
            color: "#444",
            fontSize: "1.0rem",
            marginTop: "2px",
            maxWidth: "520px"
          }}>
            Enjoy quick, reliable, and protected withdrawal processing at any time.
          </div>
        </div>
      </div>
      {/* End Fast & Secure Withdrawals */}
    </div>
  );
};

export default Home;
