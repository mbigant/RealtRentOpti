import React, {useCallback, useEffect, useReducer} from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import {actions, initialState, reducer} from "./state";

function EthProvider({children}) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const init = useCallback(
        async artifact => {
            if (artifact) {
                const web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");

                let accounts;
                try {
                    accounts = await web3.eth.requestAccounts();
                }catch (err) {
                    console.error(err)
                }

                const networkID = await web3.eth.net.getId();
                const {abi} = artifact;
                let address, contract, genesisBlock;
                try {
                    address = artifact.networks[networkID].address;
                    contract = new web3.eth.Contract(abi, address);
                } catch (err) {
                    console.error(err);
                }

                try {
                    const txHash = artifact.networks[networkID].transactionHash;
                    const tx = await web3.eth.getTransaction(txHash);
                    genesisBlock = tx.blockNumber;
                } catch (err) {
                    genesisBlock = 0;
                    console.log(err)
                }

                dispatch({
                    type: actions.init,
                    data: {artifact, web3, accounts, networkID, contract, genesisBlock}
                });
            }
        }, []);

    useEffect(() => {
        const tryInit = async () => {
            try {
                const artifact = require("../../contracts/RealtRentOptiFactory.json");
                init(artifact);
            } catch (err) {
                console.error(err);
            }
        };

        tryInit();
    }, [init]);

    useEffect(() => {
        const events = ["chainChanged", "accountsChanged"];
        const handleChange = () => {
            init(state.artifact);
        };

        events.forEach(e => window.ethereum.on(e, handleChange));
        return () => {
            events.forEach(e => window.ethereum.removeListener(e, handleChange));
        };
    }, [init, state.artifact]);

    return (
        <EthContext.Provider value={{
            state,
            dispatch
        }}>
            {children}
        </EthContext.Provider>
    );
}

export default EthProvider;
