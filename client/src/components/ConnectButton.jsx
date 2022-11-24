import {shortAddress} from "../utils";
import {useEth} from "../contexts/EthContext";

export default function ConnectButton( props ){


    const { state: { web3 } } = useEth();

    function handleConnect() {
        web3.eth.requestAccounts()
    }

    if( props.address ) {

        return (
            <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-secondary btn-sm">
                    {shortAddress(props.address)}
                </button>
            </div>
        );
    }
    else {

        return (
            <div className="navbar-end">
                <button className="btn btn-primary btn-sm" onClick={handleConnect}>Connect</button>
            </div>
        );
    }
}