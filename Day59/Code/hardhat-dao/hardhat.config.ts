import "hardhat-deploy"
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat"
import { HardhatUserConfig } from "hardhat/config"


const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 2100000,
      gasPrice: 8000000000,
      allowUnlimitedContractSize: true,

    },
    localhost: {
      chainId: 31337,
      gas: 2100000,
      gasPrice: 8000000000,
      allowUnlimitedContractSize: true,

    }
  },
  solidity: "0.8.17",
  namedAccounts: {
    deployer: {
      default: 0,

    }
  }
}

export default config 
