import { useEffect, useState } from "react";
import { ethers } from "ethers";

// ✅ Contract details
const CONTRACT_ADDRESS = "0x406F997Ea6b857432aDE179e87fd00e94955Ed26";
const ABI = [
  {
    inputs: [{ internalType: "string", name: "_newMessage", type: "string" }],
    name: "setMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getMessage",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "message",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

function App() {
  const [message, setMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");

  // ✅ Connect to MetaMask (only on user interaction)
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed. Please install it.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      await fetchMessage(); // Fetch after connecting
    } catch (err) {
      if (err.code === 4001) {
        setError("User rejected the connection request.");
      } else {
        setError("Error connecting wallet: " + err.message);
      }
    }
  };

  // ✅ Get the current message from the contract
  const fetchMessage = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const data = await contract.getMessage();
      setMessage(data);
      setError(""); // Clear errors on success
    } catch (err) {
      console.error(err);
      setError("Error fetching message: " + (err.reason || err.message));
    }
  };

  // ✅ Send a new message to the contract
  const updateMessage = async () => {
    try {
      if (!newMessage.trim()) {
        setError("Please enter a non-empty message.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.setMessage(newMessage);
      setError("Waiting for confirmation...");
      await tx.wait();

      setNewMessage("");
      await fetchMessage();
    } catch (err) {
      console.error(err);
      if (err.code === "ACTION_REJECTED") {
        setError("User denied transaction signature.");
      } else {
        setError("Error updating message: " + (err.reason || err.message));
      }
    }
  };

  // ✅ Effect: Check connection & listen for changes
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum?.selectedAddress) {
        setAccount(window.ethereum.selectedAddress);
        await fetchMessage();
      }
    };

    checkConnection();

    if (window.ethereum) {
      // Handle account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchMessage();
        } else {
          setAccount("");
          setMessage("");
        }
      });

      // Reload on network change (recommended)
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>📝 Smart Contract Messenger</h1>

      {account ? (
        <p>
          <strong>Connected Wallet:</strong> {account}
        </p>
      ) : (
        <button
          onClick={connectWallet}
          style={{ padding: "10px", fontSize: "16px", marginBottom: "20px" }}
        >
          🔌 Connect MetaMask
        </button>
      )}

      <h2>📬 Current Message:</h2>
      <p>{message || "No message yet"}</p>

      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Enter new message"
        style={{ padding: 10, width: "300px" }}
      />
      <button
        onClick={updateMessage}
        disabled={!account || !newMessage.trim()}
        style={{
          marginLeft: 10,
          padding: 10,
          opacity: !account || !newMessage.trim() ? 0.6 : 1,
        }}
      >
        Update Message
      </button>

      {error && <p style={{ color: "red", marginTop: 20 }}>{error}</p>}
    </div>
  );
}

export default App;
