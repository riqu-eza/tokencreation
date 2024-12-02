import { VersionedTransaction, Connection, Keypair, Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";
import express from "express";
import FormData from "form-data";
import fs from "fs";
import fetch from "node-fetch"; // Ensure you have this installed for fetch in Node.js

dotenv.config();

const MAX_RETRIES = 3;
const RETRY_DELAY = 3000;
const app = express();
const port = 3000;
const PRIVATE_KEYS = process.env.PRIVATE_KEYS;

const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
const web3Connection = new Connection(RPC_ENDPOINT, "confirmed");

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  
  // Automatically call the function when the app starts
  sendLocalCreateTx(); // Add this line to start the process immediately when the app starts
});

async function sendLocalCreateTx() {
    try {
      console.log("Starting token creation transaction...");
  
      let retryCount = 0;
      let metadataResponseJSON;
  
      // Retry loop for IPFS metadata upload
      while (retryCount < MAX_RETRIES) {
        try {
          console.log(`Attempting IPFS upload... (Attempt ${retryCount + 1})`);
  
          // Prepare form data
          const formData = new FormData();
          formData.append("file", fs.createReadStream("./example.png"));
          formData.append("name", "PPTest");
          formData.append("symbol", "TEST");
          formData.append("description", "This is an example token created via PumpPortal.fun");
          formData.append("twitter", "https://x.com/a1lon9/status/1812970586420994083");
          formData.append("telegram", "https://x.com/a1lon9/status/1812970586420994083");
          formData.append("website", "https://pumpportal.fun");
          formData.append("showName", "true");
  
          // Perform fetch request with a timeout option
          const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
            method: "POST",
            body: formData,
            timeout: 10000, // Set a timeout of 10 seconds
          });
  
          // Parse the response
          metadataResponseJSON = await metadataResponse.json();
  
          if (metadataResponseJSON.metadata) {
            console.log("Metadata uploaded to IPFS successfully.");
            break; // Exit the retry loop if successful
          } else {
            throw new Error("Failed to upload metadata to IPFS.");
          }
        } catch (error) {
          retryCount++;
          console.error(`Error in IPFS upload (Attempt ${retryCount}): ${error.message}`);
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY)); // Delay before retrying
          } else {
            throw new Error("Failed to upload metadata after multiple attempts.");
          }
        }
      }
  
      // Continue with the rest of the process (token creation, etc.)
      console.log("Proceeding with the rest of the token creation...");
      // (Your remaining code here...)
  
    } catch (error) {
      console.error("Error in transaction:", error);
    }
  }
