import {textToBytes,hexToBytes,bytesToHex} from "./bytes.js";

export async function digest(data,algorithm,type="text"){
    let b=
        type==="hex"
            ?hexToBytes(data)
            :type==="bytes"
                ?new Uint8Array(data)
                :textToBytes(data);

    return bytesToHex(
        new Uint8Array(
            await crypto.subtle.digest(
                algorithm,
                b
            )
        )
    );
}

export async function hmac(
    data,
    key,
    algorithm="SHA-256"
){
    let k=await crypto.subtle.importKey(
        "raw",
        textToBytes(key),
        {
            name:"HMAC",
            hash:algorithm
        },
        false,
        ["sign"]
    );

    return bytesToHex(
        new Uint8Array(
            await crypto.subtle.sign(
                "HMAC",
                k,
                textToBytes(data)
            )
        )
    );
}