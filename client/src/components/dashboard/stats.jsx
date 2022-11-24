import {formatAmount} from "../../utils";

export default function Stats(props) {

    return (
        <div className="stats shadow w-full">

            <div className="stat place-items-center">
                <div className="stat-title">Wallet</div>
                <div className="stat-value">{ formatAmount(props.walletBalance)}</div>
                <div className="stat-desc">USDC</div>
            </div>

            <div className="stat place-items-center">
                <div className="stat-title">Lending</div>
                <div className="stat-value text-success">{formatAmount(props.lendingBalance)}</div>
                <div className="stat-desc text-secondary">xDai</div>
            </div>

            <div className="stat place-items-center">
                <div className="stat-title">Borrowing</div>
                <div className="stat-value text-error">{formatAmount(props.borrowingBalance)}</div>
                <div className="stat-desc">xDai</div>
            </div>

        </div>
    );
}