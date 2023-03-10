import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';




export const TransactionContext = React.createContext();

const { ethereum } = window; // provided by metamask




const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract
}

export const TransactionProvider = ({ children }) => {
    
    console.log(ethereum)
    console.log(ethers)

    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);
    //The setFormData function updates the state object to a new object 
    // that is created by spreading the previous state prevState and then overwriting 
    // the value of the property with the name passed as name argument with the new 
    // value from the e.target.value property of the event object.

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}))
    }

    const getAllTransactions = async () => {
        try {
            if (!ethereum) return alert("Please install metamask")
            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18),  // from gwei to ETH

            }))
            setTransactions(structuredTransactions);
            console.log(structuredTransactions)
        } catch (error) {
            console.log(error);
            throw new Error("no ethereum object.");
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Please install metamask"); // if ethereum object not found, this means Metamask is not installed

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                getAllTransactions();
            // get all transactions
            //getAllTransactions();
            } else {
                console.log("No Accounts found.");
            }
        } catch (error) {

            throw new Error("no ethereum object.")
        }
    };

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem("transactionCount", transactionCount)

        } catch (error) {
            console.log(error);
            throw new Error("no ethereum object.");
        }
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const accounts = await ethereum.request({ method: 'eth_requestAccounts'})

            setCurrentAccount(accounts[0])
        } catch (error) {
            console.log(error);
            throw new Error("no ethereum object.");
        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");
            console.log(ethereum)
            //get data from form.
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();    // contract related functions
            const parsedAmount = ethers.utils.parseEther(amount); // pass amount into GWEI

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas:'0x5208',      //hex for 21000 GWEI
                    value: parsedAmount._hex, 
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword); // async action to get transactionHash 

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success! - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber());

        } catch (error) {
            console.log(error);
            throw new Error("no ethereum object.");
        }

    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist
    }, []);

return (
    <TransactionContext.Provider 
    value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        isLoading,
    }}
    >
        {children}
    </TransactionContext.Provider>
)
}