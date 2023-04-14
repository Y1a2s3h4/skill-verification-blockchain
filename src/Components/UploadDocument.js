import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import SkillVerification from "../contracts/DocumentVerification.json";
import { create as ipfsClient } from "ipfs-http-client";
const projectId = "2OF5e2F6BiQ5DwGeX07B6NbJwlo"; // <---------- your Infura Project ID

const projectSecret = "254470e980031297991194e26b896d90";

const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});
function UploadDocument() {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const enableMetaMask = async () => {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.error(error);
      }
    };
    enableMetaMask();
  }, []);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleLevelChange = (event) => {
    setLevel(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAddSkill = async () => {
    if (!name || !level || !file) {
      setStatus("Please enter all fields");
      return;
    }

    const reader = new window.FileReader();
    console.log(file);
    reader.readAsArrayBuffer(file);
    reader.onloadend = async () => {
      try {
        const buffer = Buffer.from(reader.result);
        const added = await ipfs.add(buffer);
        const ipfsHash = added.cid.toString();

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          SkillVerification.networks[5777].address,
          SkillVerification.abi,
          signer
        );

        const transaction = await contract.addSkill(name, level, ipfsHash);
        await transaction.wait();

        setStatus("Skill added successfully");
      } catch (error) {
        console.error(error);
        setStatus("Error adding skill");
      }
    };
  };

  const handleVerifySkill = async () => {
    if (!file) {
      setStatus("Please upload a file");
      return;
    }

    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = async () => {
      const buffer = Buffer.from(reader.result);

      try {
        const added = await ipfs.add(buffer);
        const ipfsHash = added.cid.toString();

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          SkillVerification.networks[5777].address,
          SkillVerification.abi,
          provider
        );

        const verified = await contract.verifySkill(ipfsHash, name, level);
        console.log(verified);
        if (verified) {
          setStatus("Skill verified");
        } else {
          setStatus("Skill not found");
        }
      } catch (error) {
        console.error(error);
        setStatus("Error verifying skill");
      }
    };
  };

  return (
    <div>
      <h1>Skill Verification</h1>
      <label>
        Name:
        <input type="text" value={name} onChange={handleNameChange} />
      </label>
      <br />
      <label>
        Level:
        <input type="number" value={level} onChange={handleLevelChange} />
      </label>
      <br />
      <label>
        File:
        <input type="file" onChange={handleFileChange} />
      </label>
      <br />
      <button onClick={handleAddSkill}>Add Skill</button>
      <button onClick={handleVerifySkill}>Verify Skill</button>
      <br />
      <div>{status}</div>
    </div>
  );
}

export default UploadDocument;
