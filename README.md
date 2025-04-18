# Testing Enviornment for blockchain functionalities for StockOverflow
<img src="./misc/bline.gif">

## <img src="./misc/github.gif" width=60 height=60> Parent GitHub: https://github.com/Unknnownnn/StockOverflow
A blockchain based enviornment for StockOverflow Webpage built using Hardhat and Solidity for minting contracts and crypto tokens using a local blockchain chain network. This can be accessed using any blockchain wallet such as MetaMask.
<br/>Local Chain deployed using hardhat and Solidity contracts. User Interface built using react.js.

## <img src="./misc/brack.gif" width=60 height=60> How To Run
- To Deploy the local chain using Hardhat: <br/><br/>
`cd test`
<br/>

> [!NOTE]
> The project already has node modules installed

<br/>

```
npx hardhat compile
npx hardhat run scripts\depoly.js --network localhost
npx hardhat node
```

The Hardhat runs on http://localhost:8454 <br/>
The local blockchain is now started.
<br/>

Now to start the User Interface Webpage: <br/>

```
cd ..
cd vyfn
npm start
```
