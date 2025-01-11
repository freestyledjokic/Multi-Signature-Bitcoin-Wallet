import {
    openContractCall,
    ContractCallOptions,
  } from "@stacks/connect";
  import { STACKS_MAINNET, STACKS_TESTNET, STACKS_DEVNET } from '@stacks/network';
  import {
    stringAsciiCV,
    uintCV,
    standardPrincipalCV,
    cvToJSON,
    fetchCallReadOnlyFunction,
  } from "@stacks/transactions";
  
  const contractAddress = "ST126KB63EGE5P99FTYEWH0Z195CP1YXMEZ5BDNNA";
  const contractName = "multi-sig-wallet";
  
  export const contractCalls = {
    proposeTransaction: async (id: number, to: string, amount: number) => {
      const functionArgs = [uintCV(id), stringAsciiCV(to), uintCV(amount)];
  
      const options: ContractCallOptions = {
        network: 'testnet',
        contractAddress,
        contractName,
        functionName: "propose-transaction",
        functionArgs,
        onFinish: (data) => {
          console.log("Transaction submitted:", data);
        },
      };
  
      await openContractCall(options);
    },
  
    approveTransaction: async (id: number) => {
      const options: ContractCallOptions = {
        network: 'testnet',
        contractAddress,
        contractName,
        functionName: "approve-transaction",
        functionArgs: [uintCV(id)],
        onFinish: (data) => {
          console.log("Approval submitted:", data);
        },
      };
  
      await openContractCall(options);
    },
  
    executeTransaction: async (id: number) => {
      const options: ContractCallOptions = {
        network: 'testnet',
        contractAddress,
        contractName,
        functionName: "execute-transaction",
        functionArgs: [uintCV(id)],
        onFinish: (data) => {
          console.log("Execution submitted:", data);
        },
      };
  
      await openContractCall(options);
    },
  
    getTransaction: async (id: number) => {
      try {
        const result = await fetchCallReadOnlyFunction({
          contractAddress,
          contractName,
          functionName: "get-transaction",
          functionArgs: [uintCV(id)],
          network: 'testnet',
          senderAddress: contractAddress,
        });
  
        const transactions = cvToJSON(result);
        console.log("Fetched Transactions:", transactions);
        return transactions;
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return null;
      }
    },
  
    getApprovalStatus: async (id: number) => {
      try {
        const result = await fetchCallReadOnlyFunction({
          contractAddress,
          contractName,
          functionName: "get-approval-status",
          functionArgs: [uintCV(id)],
          network: 'testnet',
          senderAddress: contractAddress,
        });
  
        const status = cvToJSON(result);
        console.log("Approval status:", status);
        return status;
      } catch (error) {
        console.error("Error checking approval status:", error);
        return {
          senderApproved: false,
          receiverApproved: false
        };
      }
    },
  
    canApprove: async (id: number, approver: string) => {
      try {
        const result = await fetchCallReadOnlyFunction({
          contractAddress,
          contractName,
          functionName: "can-approve",
          functionArgs: [uintCV(id), standardPrincipalCV(approver)],
          network: 'testnet',
          senderAddress: contractAddress,
        });
  
        return cvToJSON(result);
      } catch (error) {
        console.error("Error checking can-approve status:", error);
        return false;
      }
    },
  };
  
  export default contractCalls;