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
function UserPage() {
  const [name, setName] = useState("");
  const [skillId, setSkillId] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [addr, setAddr] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const enableMetaMask = async () => {
      try {
        const ans = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setAddr(ans[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          SkillVerification.networks[5777].address,
          SkillVerification.abi,
          provider
        );
        console.log({ provider, contract });
        let bal = await provider.getBalance(ans[0]);
        bal = ethers.utils.formatEther(bal);
        setBalance(bal);
      } catch (error) {
        console.error(error);
      }
    };
    enableMetaMask();
  }, []);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleSkillIdChange = (event) => {
    setSkillId(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAddSkill = async () => {
    if (!name || !skillId || !file) {
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

        const transaction = await contract.addSkill(name, skillId, ipfsHash);
        await transaction.wait();

        setStatus("Skill added successfully");
      } catch (error) {
        console.error(error);
        setStatus("Error adding skill");
      }
    };
  };
  return (
    <div className="container text-center">
      <h1 className="fw-bold">Skill Verification</h1>
      <h5>Account Address: {addr}</h5>
      <h5>Account Balance: {balance}</h5>
      <label className="text-start w-100 fw-bold my-2">
        Name:
        <input
          className="form-control"
          type="text"
          value={name}
          onChange={handleNameChange}
          style={{ height: "2.6rem" }}
        />
      </label>
      <br />
      <label className="text-start w-100 fw-bold my-2">
        SkillId:
        <input
          className="form-control"
          type="number"
          value={skillId}
          onChange={handleSkillIdChange}
          style={{ height: "2.6rem" }}
        />
      </label>
      <br />
      <label htmlFor="uploadfile" className="fw-bold text-start w-100">
        File Upload:{" "}
      </label>
      <label
        className="text-start w-100 fw-bold my-2 position-relative rounded border border-1"
        style={{ height: "6rem" }}
      >
        <div className=" w-100 h-100 ">
          <span className="fw-bold position-absolute top-50 start-50 translate-middle ">
            Upload File
            <i className="bi bi-file-earmark-plus fs-5"></i>
          </span>
        </div>
        <input
          id="uploadfile"
          className="form-control d-none"
          type="file"
          onChange={handleFileChange}
        />
      </label>
      <br />
      <button className="btn btn-primary m-1 w-100" onClick={handleAddSkill}>
        <p className="d-inline">Add Skill</p>
        <i className="bi bi-plus fs-5"></i>
      </button>
      <br />
      {!!status && (
        <div
          className={`alert ${
            status === "Skill added successfully"
              ? "alert-success"
              : "alert-warning"
          } alert-dismissible fade show`}
          role="alert"
        >
          <strong>{status}</strong>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          ></button>
        </div>
      )}
    </div>
  );
}

export default UserPage;
