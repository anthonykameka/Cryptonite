// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract Transactions {

    uint256 transactionCount;

    //transfer event

    event Transfer(address from, address receiver, uint amount, string message, uint256 timestamp, string keyword);

    // declare structure for transfer object
    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }

    TransferStruct[] transactions;

    function addToBlockchain(address payable receiver, uint amount, string memory message, string memory keyword) public {

        transactionCount += 1; // increate transaction amount
        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword)); // create transaction and push to array

        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);// transfer on to blockchain

    }

    function getAllTransactions() public view returns (TransferStruct[] memory) {
        return transactions;

    }

    function getTransactionCount() public view returns (uint256) {
        return transactionCount;

    }


}