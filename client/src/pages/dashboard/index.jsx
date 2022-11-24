import {useEffect, useState} from "react";
import HeroConnect from "../../components/HeroConnect";
import ContractCreator from "../../components/dashboard/ContractCreator";
import {useEth} from "../../contexts/EthContext";
import Web3 from "web3";
import UserContract from "../../components/dashboard/UserContract";

export default function Dashboard() {

    const { state: { contract, accounts } } = useEth();
    const [contractAddress, setContractAddress] = useState();

    useEffect( () => {
        if( contract && accounts && accounts[0] ) {
            getUserContract();
        }
    }, [accounts, contract]);

    async function getUserContract() {

        try {
            const contractAddress = await contract.methods.getContractAddress().call({from: accounts[0]});

            if( Web3.utils.toBN(contractAddress).gt(Web3.utils.toBN('0')) ) {
                setContractAddress(contractAddress);
            }
            else {
                setContractAddress(null); // Is user switch wallet we have to reset to null
            }
        }catch (err) {
            console.error(err);
            setContractAddress(null);
        }
    }

    function handleOnCreated() {
        getUserContract();
    }

    function render() {

        if( typeof contract === 'undefined' || !accounts || accounts?.length === 0 ) {
            return <HeroConnect/>;
        }
        else if( contractAddress ) {
            return <UserContract address={contractAddress}/>;
        }
        else {
            return <ContractCreator onCreated={handleOnCreated}/>;
        }
    }

    return (
        <div className="min-h-screen text-center bg-gradient-to-t to-base-100 from-blue-300 pb-4">
            {
               render()
            }
        </div>
    );
}