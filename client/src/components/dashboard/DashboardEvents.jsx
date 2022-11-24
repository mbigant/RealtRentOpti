import Web3 from "web3";
import {formatAmount} from "../../utils";

export default function DashboardEvents(props ){

    function getDate( blockTimestamp ) {
        return (new Date(blockTimestamp*1000)).toLocaleString();
    }

    return (
        <>
            <div className="card w-full bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">History</h2>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Action</th>
                                <th>USDC spent</th>
                                <th>Xdai used</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                props.events?.length === 0 && <tr><td colSpan={4} className={"text-center"}>No USDC spent yet</td></tr>
                            }
                            {
                                props.events.sort( (a,b) => {
                                    return a.timestamp > b.timestamp ? 1 : a.timestamp === b.timestamp ? 0 : -1
                                }).reverse().map( (event,id) => (
                                    <tr key={id}>
                                        <th>{getDate(event.timestamp)}</th>
                                        <td>{event.type}</td>
                                        <td>{formatAmount(Web3.utils.fromWei(event.amountUsdc, 'mwei'))}</td>
                                        <td>{formatAmount(Web3.utils.fromWei(event.amountXdai))}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );

}