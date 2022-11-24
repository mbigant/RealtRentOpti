import Link from "next/link";
import Step from "../components/docs/Step";
import gelato1 from "../../public/img/doc/gelato-1.png";
import gelato2 from "../../public/img/doc/gelato-2.png";
import gelato3 from "../../public/img/doc/gelato-3.png";
import gelato4 from "../../public/img/doc/gelato-4.png";
import gelato5 from "../../public/img/doc/gelato-5.png";
import gelato6 from "../../public/img/doc/gelato-6.png";
import create from "../../public/img/doc/create.png";
import approve from "../../public/img/doc/approve.png";
import copy from "../../public/img/doc/copy-address.png";

export default function Doc() {
    return (
        <div className="bg-base-300">
            <div className="container w-full sm:max-w-screen-lg mx-auto text-center pt-4">
                <ul className="steps steps-vertical">
                    <Step title={"Create your contract"} img={create}>
                        <p>
                            Go to <Link href="/dashboard">dashboard</Link>, connect your wallet and create your contract <br/>
                            The only parameter is the max amount of USDC (weekly rent) you want to be spent each time the contract is triggered
                        </p>
                    </Step>
                    <Step title={"Allow your contract to spend your USDC"} img={approve}>
                        <p>
                            Click to <span className={"font-mono font-light text-accent"}>Approve spending USDC</span> button
                        </p>
                    </Step>
                    <Step title={"Setting up automation"} img={copy}>
                        <p>
                            <span className={"font-mono font-light text-accent"}>Copy</span> your contract address from your dashboard <br/>
                            Go to <a href="https://app.gelato.network/" target={"_blank"} rel={"noopener noreferrer"}>Gelato</a>, connect your wallet on Gnosis
                        </p>
                    </Step>
                    <Step title={"Gelato: create task"} img={gelato1}>
                        <p>
                            Click the <span className={"font-mono font-light text-accent"}>Create Task</span> Button and paste your contract address into the field
                        </p>
                    </Step>
                    <Step title={"Gelato: select function"} img={gelato2}>
                        <p>
                            Click the <span className={"font-mono font-light text-accent"}>Select a function</span> field and choose <span className={"font-mono font-light text-accent"}>rmmDeposit()</span> OR <span className={"font-mono font-light text-accent"}>rmmRepay()</span>
                        </p>
                    </Step>
                    <Step title={"Whitelisting gelato contract"} img={gelato3}>
                        <p>
                            You should see a message that indicate the msg.sender address <br/>
                            You have to whitelist this address. Copy this address and go to your dashboard. <br/>
                            Then past gelalo address in the whitelisting field and validate.
                        </p>
                    </Step>
                    <Step title={"Gelato: scheduled execution"} img={gelato4}>
                        <p>
                            Go back to Gelato task and choose when you want your contract to be called. <br/>
                            Here we want to use our weekly realt rent so choose 7 days interval and start time from monday evening or tuesday to be safe but it's up to you.
                        </p>
                    </Step>
                    <Step title={"Gelato: payment"} img={gelato5}>
                        <p>
                            As you know transactions are not free so you have to deposit some xDAI into your account to let gelato use this for paying gas. <br/>
                            On Gnosis, transaction cost is verry cheap so with 1 xDAI you can process more than 1000 call.
                        </p>
                    </Step>
                    <Step title={"Gelato: end"} img={gelato6}>
                        <p>
                            Name your task and then click <span className={"font-mono font-light text-accent"}>Create Task</span> button
                        </p>
                    </Step>
                </ul>
            </div>
        </div>
    );
};