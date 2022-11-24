import Web3 from "web3";
import {useState} from "react";
import {useEth} from "../../contexts/EthContext";
import {runTx} from "../../utils";

export default function ContractCreator(props) {

    const { state: { contract, accounts } } = useEth();

    // If a string is given it returns a number string, otherwise a BN.js instance.
    const [weiAmount, setWeiAmount] = useState(Web3.utils.toBN(0));

    function handleAmountChanged(e) {
        const val = e.target.value;
        if( val ) {
            const wei = Web3.utils.toWei(val, 'mwei');
            setWeiAmount(Web3.utils.toBN(wei));
        }
        else {
            setWeiAmount(Web3.utils.toBN(0))
        }
    }

    async function handleCreate() {

        const tx = contract.methods.createContract(weiAmount).send({from: accounts[0]}).then( () => {
            return new Promise( (resolve) => {
                props.onCreated();
                resolve();
            });
        });

        runTx(tx, "Creating your contract...", "Contract created !", "An error occured");
    }

    return (
        <>
            <div className="hero min-h-screen">
                <div className="hero-content flex-col lg:flex-row">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl font-bold">Create your contract</h1>

                        <div className="alert alert-info shadow-lg my-4">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Please use the <b>same wallet</b> that receives your Realt rent</span>
                            </div>
                        </div>
                    </div>
                    <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                        <div className="card-body">

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Enter max USDC amount</span>
                                </label>
                                <label className="input-group">
                                    <input type="number" placeholder="100" className="input input-bordered" onChange={handleAmountChanged} required/>
                                    <span>USDC</span>
                                </label>
                            </div>

                            <p className="text-sm">
                                To avoid using the whole amount of USDC in your wallet you must indicate the <b>maximum amount of USDC spent each time</b> an action (deposit or repay) is called.
                            </p>
                            <p className="">
                                <u>In most cases</u> :<br/> <span className="font-light text-primary">max USDC amount = rent amount</span>
                            </p>

                            <div className="form-control mt-6">
                                <button className="btn btn-primary" onClick={handleCreate} disabled={weiAmount <= 0}>Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}