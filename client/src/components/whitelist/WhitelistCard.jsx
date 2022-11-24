import {shortAddress} from "../../utils";
import {useEth} from "../../contexts/EthContext";
import {useRef, useState} from "react";
import Web3 from "web3";

export default function WhitelistCard(props) {

    const { state: { accounts } } = useEth();
    const addressInput = useRef();
    const [isValid, setIsValid] = useState(false);

    function getAction(address, index) {

        if( accounts[0] === address ){
            return <div className="badge badge-secondary">You</div>
        }
        else {
            return (
                <button className="btn btn-outline btn-error btn-xs" onClick={() => handleDeleteAddress(index)}>
                    Remove
                </button>
            );
        }

    }

    function handleWhitelistAddress() {
        const address = Web3.utils.toChecksumAddress(addressInput.current.value);
        props.onWhitelisting(address, true);
        addressInput.current.value = null;
    }

    function handleDeleteAddress(index) {
        props.onRemoveWhitelisting(index);
    }

    function handleInputChanged(e) {
        const address = e.target.value;
        const isValid = Web3.utils.isAddress(address);

        setIsValid(isValid)
    }

    return (
        <div className="card w-full bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Whitelist</h2>
                <ul className="text-left">
                {
                    props.whitelist.map( (address,id) => {
                        return <li key={id} className="font-mono flex content-center">
                            <span className="pr-4">
                                { shortAddress(address,6) }
                            </span>

                            {
                                getAction(address, id)
                            }

                        </li>
                    })
                }
                </ul>

                <div className="form-control pt-2">
                    <div className="input-group">
                        <input
                            ref={addressInput}
                            type="text"
                            placeholder="ie: Gelato smart contract address"
                            className="input input-bordered input-sm w-full"
                            onChange={handleInputChanged}
                        />
                        <button className="btn btn-sm btn-primary btn-square" onClick={handleWhitelistAddress} disabled={!isValid}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <p className="text-gray-400 text-sm pt-2">
                    Whitelisted address can call <span className="font-mono text-gray-300">rmmDeposit()</span> and <span className="font-mono text-gray-300">rmmRepay()</span> methods
                </p>

            </div>
        </div>
    );
}