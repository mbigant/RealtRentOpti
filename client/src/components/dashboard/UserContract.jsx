import {useEffect, useRef, useState} from "react";
import Web3 from "web3";
import artefact from "../../contracts/RealtRentOpti.json";
import IERC20 from "../../contracts/IERC20.json";
import {useEth} from "../../contexts/EthContext";
import DashboardEvents from "./DashboardEvents";
import WhitelistCard from "../whitelist/WhitelistCard";
import Stats from "./Stats";
import {ClipboardIcon} from "@heroicons/react/24/outline";
import {quickToast, runTx} from "../../utils";

export default function UserContract(props) {

    const { state: { accounts, web3, genesisBlock } } = useEth();

    const [walletBalance, setWalletBalance] = useState('-');
    const [lendingBalance, setLendingBalance] = useState('-');
    const [borrowingBalance, setBorrowingBalance] = useState('-');
    const [usdcAllowance, setUsdcAllowance] = useState(Web3.utils.toBN(0));
    const [events, setEvents] = useState([]);
    const [whitelist, setWhitelist] = useState([]);

    const USDCContract = useRef();
    const aWXDAIContract = useRef();
    const variableDebtWXDAIContract = useRef();
    const userContract = useRef();

    useEffect( () => {
        loadContract();
    }, [])

    async function loadContract() {

        userContract.current = new web3.eth.Contract(artefact.abi, props.address);
        USDCContract.current = new web3.eth.Contract(IERC20.abi, "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83");
        aWXDAIContract.current = new web3.eth.Contract(IERC20.abi, "0x7349C9eaA538e118725a6130e0f8341509b9f8A0");
        variableDebtWXDAIContract.current = new web3.eth.Contract(IERC20.abi, "0x6a7CeD66902D07066Ad08c81179d17d0fbE36829");

        getAllowance();

        getBalances();

        getEvents();

        getWhitelistedAddresses();
    }

    async function getAllowance() {
        try {
            const usdcAllowance = await USDCContract.current.methods.allowance(accounts[0], props.address).call();
            setUsdcAllowance(Web3.utils.toBN(usdcAllowance));
        } catch (error) {
            console.error(error);
        }
    }

    async function getBalances() {

        try {
            const userUsdc = await USDCContract.current.methods.balanceOf(accounts[0]).call();
            const useraWxDAI = await aWXDAIContract.current.methods.balanceOf(accounts[0]).call();
            const debtaWxDAI = await variableDebtWXDAIContract.current.methods.balanceOf(accounts[0]).call();

            setWalletBalance(Web3.utils.fromWei(userUsdc, 'mwei'));
            setLendingBalance(Web3.utils.fromWei(useraWxDAI));
            setBorrowingBalance(Web3.utils.fromWei(debtaWxDAI));
        } catch (error) {
            console.error(error);
        }
    }

    async function getEvents() {
        const depositEventTx = userContract.current.getPastEvents('Deposit', {fromBlock: genesisBlock});
        const repayEventTx = userContract.current.getPastEvents('Repaid', {fromBlock: genesisBlock});

        Promise.allSettled([depositEventTx, repayEventTx]).then( async events => {

            const depositEvents = [];

            for( const eventType of events ) {

                for( const event of eventType.value ) {
                    const block = await web3.eth.getBlock(event.blockNumber);

                    depositEvents.push({
                        type: event.event,
                        amountUsdc: event.returnValues._amountUSDC,
                        amountXdai: event.returnValues._amountWXDAI,
                        timestamp: block.timestamp
                    });
                }
            }

            setEvents(depositEvents);
        });
    }

    async function getWhitelistedAddresses() {

        const whitelistedAddresses = [];

        userContract.current.methods.whitelistSize().call().then( async size  => {

            for( let i=0; i<size; i++ ) {
                try {
                    const address = await userContract.current.methods.whitelistAddresses(i).call();
                    const isWhitelisted = await userContract.current.methods.isWhitelisted(address).call();

                    if( isWhitelisted ) {
                        whitelistedAddresses.push(address);
                    }
                } catch (err) {
                    console.error(err)
                }
            }

            setWhitelist(whitelistedAddresses);

        }).catch(err => {
            console.error(err)
        });
    }

    async function handleWhitelisting(address) {
        const tx = userContract.current.methods.whitelistAddress(address).send({from: accounts[0]}).then( () => {
            return new Promise( (resolve) => {
                getWhitelistedAddresses();
                resolve();
            });
        });
        runTx(tx, 'Pending whitelisting...', 'Successfully whitelisted', 'Error whitelisting')
    }

    async function handleRemoveWhitelisting(index) {
        const tx = userContract.current.methods.removeFromWhitelist(index).send({from: accounts[0]}).then( () => {
            return new Promise( (resolve) => {
                getWhitelistedAddresses();
                resolve();
            });
        });
        runTx(tx, 'Removing whitelisting...', 'Successfully removed', 'Error removing whitelisting')
    }

    function handleApprove() {
        const amountBN = Web3.utils.BN(2).pow(Web3.utils.BN(256)).sub(Web3.utils.BN(1));
        const tx = USDCContract.current.methods.approve(props.address, amountBN).send({from: accounts[0]}).then( () => {
            return new Promise(function(resolve, reject) {
                getAllowance();
                resolve();
            })
        });
        runTx(tx, 'Pending approval...', 'Contract approved !', 'Error approving contract' );
    }

    function handleRevoke() {
        const tx = USDCContract.current.methods.approve(props.address, Web3.utils.toBN(0)).send({from: accounts[0]}).then( () => {
            return new Promise(function(resolve, reject) {
                getAllowance();
                resolve();
            })
        })

        runTx(tx, 'Revoking approval...', 'Approval revoked !', 'Error revoking approval');
    }

    function handleAddressCopied() {
        navigator.clipboard.writeText(props.address);
        quickToast('Address copied');
    }

    function getApprovalContent() {
        // todo check allowance < maxusdc
        if( usdcAllowance?.eq(Web3.utils.toBN(0)) ) {
            return (
                <>
                    <p>You need to approve the smart contract to spend your USDC</p>
                    <div className="card-actions justify-center">
                        <button className={`btn btn-primary`} onClick={handleApprove}>Approve spending USDC</button>
                    </div>
                </>
            );
        }

        return (
            <>
                <p>
                    You can revoke your previous approval at any time.<br/>
                    After that your USDC can no longer be spent.
                </p>
                <div className="card-actions justify-center">
                    <button className={`btn btn-error btn-outline`} onClick={handleRevoke}>Revoke approval</button>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="container w-full sm:max-w-screen-lg mx-auto">
                <h1 className="text-5xl pt-6 pb-1">Dashboard</h1>
                <h2 className="text-sm font-light pb-6 font-mono text-gray-400">
                    {props.address}
                    <button className="btn btn-ghost btn-xs btn-square ml-1" onClick={handleAddressCopied}>
                        <div className="tooltip tooltip-secondary tooltip-right" data-tip="copy"><ClipboardIcon className="h-4 w-4 text-base-400"/></div>
                    </button>
                </h2>

                <Stats walletBalance={walletBalance} lendingBalance={lendingBalance} borrowingBalance={borrowingBalance}/>

                <div className="grid grid-cols-1 md:grid-cols-2 my-4 gap-4">
                    <div className="card w-full bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Allowance</h2>
                            { getApprovalContent() }
                        </div>
                    </div>
                    <WhitelistCard
                        whitelist={whitelist}
                        onWhitelisting={(address, isWhitelisted) => handleWhitelisting(address, isWhitelisted)}
                        onRemoveWhitelisting={index => handleRemoveWhitelisting(index)}
                    />
                </div>

                <DashboardEvents events={events}/>

            </div>
        </>

    );
}