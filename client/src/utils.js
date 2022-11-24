import {toast} from "react-toastify";

export function shortAddress(addr, partZize) {
    if( addr ) {
        let size = partZize || 4;

        size = size >= 20 ? 5 : size;

        return addr.slice(0,size+2) + '...' + addr.slice(-size)
    }
};

export function formatAmount(amount) {
    return new Intl.NumberFormat('en-US',  { maximumSignificantDigits: 4 }).format(amount);
}

export function runTx( tx, pendingMsg, successMsg, errorMsg ) {
    toast.promise(
        tx,
        {
            pending: pendingMsg,
            success: successMsg,
            error: errorMsg
        },
        {
            onClose: () => {

            },
            theme: "dark"
        }
    )
}

export function quickToast(message) {
    toast(message, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "dark",
    });
}