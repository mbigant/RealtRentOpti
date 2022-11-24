import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css'

import {EthProvider} from "../contexts/EthContext";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {ToastContainer} from "react-toastify";

function MyApp({ Component, pageProps }) {
    return (
        <EthProvider>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta charSet="utf-8"/>
                <link rel="icon" href="favicon.ico" />
            </Head>
            <div>
                <Header/>
                <Component {...pageProps} />
                <Footer/>
                <ToastContainer />
            </div>
        </EthProvider>
    )
}

export default MyApp;