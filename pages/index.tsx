import { ConnectWallet, Web3Button, createMerkleTreeFromAllowList, getProofsForAllowListEntry, useAddress, useContract, useTokenBalance } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import { useState } from "react";
import { utils } from "ethers";

const Home: NextPage = () => {
  const allowList = [
    {
      "address": "0x7b345dEBE7905eEdb5ACE0Cecda94ab5F5011319",
      "maxClaimable": "100000000"
    },
    {
      "address": "0x50BAAFeAAf78f2cf1ACbE207887019Ee72962144",
      "maxClaimable": "200000000"
    }
  ];

  const [merkleRoot, setMerkleRoot] = useState<string | null>(null);

  const generateMerkleTree = async () => {
    const merkleTree = await createMerkleTreeFromAllowList(allowList);
    setMerkleRoot(merkleTree.getHexRoot());
  };

  const getUserProof = async (address: string) => {
    const merkleTree = await createMerkleTreeFromAllowList(allowList);
    const leaf = {
      "address": 0x7b345dEBE7905eEdb5ACE0Cecda94ab5F5011319,
      "maxClaimable": "100000000"
    };
    const proof = await getProofsForAllowListEntry(merkleTree, leaf);
    const proofHash = "0x" + proof[0].data.toString("hex");
    return proofHash;
  };

  const address = useAddress();
  const { contract: tokenContract } = useContract("0xC0BC84e95864BdfDCd1CCFB8A3AA522E79Ca1410");
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ConnectWallet />
        {address && (
          <div>
            <div style={{
                backgroundColor: "#222",
                padding: "2rem",
                borderRadius: "1rem",
                textAlign: "center",
                minWidth: "500px",
                marginBottom: "2rem",
                marginTop: "2rem",
              }}>
                <h1>Create Merkle Tree</h1>
                <button
                  onClick={generateMerkleTree}
                  style={{
                    padding: "1rem",
                    borderRadius: "8px",
                    backgroundColor: "#FFF",
                    color: "#333",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >Generate</button>
                {merkleRoot && (
                  <p>Merkle Root Hash: {merkleRoot}</p>
                )}
              </div>
              <div style={{
                backgroundColor: "#222",
                padding: "2rem",
                borderRadius: "1rem",
                textAlign: "center",
                minWidth: "500px",
              }}>
                <h1>ERC-20 Airdrop</h1>
                <h3>Token balance: {tokenBalance?.displayValue}</h3>
                <Web3Button
                  contractAddress="<CONTRACT_ADDRESS>"
                  action={async (contract) => contract.call(
                    "claim",
                    [
                      address,
                      utils.parseEther("<CLAIMABLE_AMOUNT>"),
                      [await getUserProof(address)],
                      utils.parseEther("<CLAIMABLE_AMOUNT>"),
                    ]
                  )}
                  onError={() => alert("Not eligible for airdrop or already claimed!")}
                  onSuccess={() => alert("Airdrop claimed!")}
                >Claim Airdrop</Web3Button>
              </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
