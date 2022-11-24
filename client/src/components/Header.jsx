import {useEth} from "../contexts/EthContext";
import ConnectButton from "./ConnectButton";
import Link from "next/link";

export default function Header() {

    const { state: { accounts } } = useEth();

    return (
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <Link href="/" passHref>
                    <a className="btn btn-ghost normal-case text-xl">
                        Realt Rent Optimizer
                    </a>
                </Link>
            </div>
            <div className="flex-none gap-2">
                <ConnectButton address={accounts && accounts[0]}/>
            </div>
        </div>
    );
}

