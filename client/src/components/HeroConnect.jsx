import Web3 from "web3";
import {useEth} from "../contexts/EthContext";

export default function HeroConnect() {

    const { state: { contract, web3 } } = useEth();

    function handleSwitchNetwork() {
        web3.currentProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: Web3.utils.toHex(100)}],
        });
    }

    function handleConnect() {
        web3.eth.requestAccounts()
    }

    function isChangingNetworkRequired() {
        return typeof contract === 'undefined';
    }

    return (
        <div className="hero min-h-screen">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">
                        Connect your wallet
                        { isChangingNetworkRequired() && <span> to <u>Gnosis</u> network</span>}
                    </h1>
                    <p className="py-6">
                        Use metamask or other wallet to connect your wallet
                    </p>
                    {
                        isChangingNetworkRequired() ? <button className="btn btn-primary" onClick={handleSwitchNetwork}>Switch to Gnosis</button> : <button className="btn btn-primary" onClick={handleConnect}>Connect</button>

                    }
                </div>
            </div>
        </div>
    );

}