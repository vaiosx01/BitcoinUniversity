import { ethers } from "hardhat";
import { keccak256, toUtf8Bytes, parseEther as ethersParseEther } from "ethers";

/**
 * Helper function to calculate keccak256 hash of a string
 * This matches the Solidity keccak256("STRING") behavior
 * In Solidity, keccak256("STRING") is equivalent to keccak256(bytes("STRING"))
 */
export function hashString(str: string): string {
  // Use ethers v6 API
  return keccak256(toUtf8Bytes(str));
}

/**
 * Helper function to parse ether values (ethers v6)
 */
export function parseEther(amount: string): bigint {
  return ethersParseEther(amount);
}
