

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/dNN3OuAssY7VNXbkcR_cYU0UDKFfhd1g",
      accounts: [
        "7739b02131423167a682f555c051878599999c40f0377598f27b72d8ebf3844f",
      ],
    }
  }
};