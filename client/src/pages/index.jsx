import Head from "next/head";
import Link from "next/link";

export default function Home() {

    return (
        <>
            <Head>
                <title>Realt Rent Optimizer</title>
                <meta name="description" content="Optimize your rent"/>
            </Head>

            <div className="hero min-h-screen bg-gradient-to-t to-base-100 from-blue-300">
                <div className="hero-content text-center">
                    <div className="">
                        <h1 className="text-4xl md:text-6xl font-bold">Optimize your rent</h1>

                        <p className="py-4 md:py-6">
                            We provide a way to automatically spend your USDC rent from Realt for debt payback or lending. <br/>
                            We will create a Smart Contract for you with some functions which can be automatically call using services like <a href="https://app.gelato.network/" target="_blank" className="link-secondary">Gelato</a>.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 place-items-center my-4">
                            <div className="card w-full md:w-96 bg-base-100 shadow-xl">
                                <div className="card-body items-center">
                                    <h2 className="card-title text-primary">Earn more</h2>
                                    <p>Automatically <span className="font-bold">deposit</span> your rent into the RMM and get some nice apy</p>
                                </div>
                            </div>
                            <div className="card w-full md:w-96 bg-base-100 shadow-xl">
                                <div className="card-body items-center">
                                    <h2 className="card-title text-primary">Payback your debt</h2>
                                    <p>Automatically <span className="font-bold">repay</span> your RMM borrowing and decrease your health factor</p>
                                </div>
                            </div>
                        </div>

                        <Link href={'/dashboard/'} passHref>
                            <button className="btn btn-primary btn-lg mt-4">Optimize my rent</button>
                        </Link>
                        <br/>
                        <Link href={'/doc/'} passHref>
                            <button className="btn btn-secondary mt-4">How to</button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};