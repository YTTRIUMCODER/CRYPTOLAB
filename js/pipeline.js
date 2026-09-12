import {
    decode,
    encode,
    bytesToHex,
    bytesToBase64,
    baseToBytes,
    hexToBytes,
    base64ToBytes
} from "./bytes.js";

import {digest} from "./hash.js";

export async function runPipeline(input,stages){
    let value=input;

    for(let s of stages){
        switch(s){

            case"text":
                value=bytesToHex(
                    decode(value,"text")
                );
                break;

            case"hex":
                value=bytesToHex(
                    hexToBytes(value)
                );
                break;

            case"base64":
                value=bytesToBase64(
                    hexToBytes(value)
                );
                break;

            case"base58":
                value=encode(
                    hexToBytes(value),
                    "base",
                    58
                );
                break;

            case"binary":
                value=encode(
                    hexToBytes(value),
                    "binary"
                );
                break;

            case"decimal":
                value=encode(
                    hexToBytes(value),
                    "decimal"
                );
                break;

            case"sha256":
                value=await digest(
                    value,
                    "SHA-256",
                    "text"
                );
                break;

            case"base16decode":
                value=bytesToHex(
                    hexToBytes(value)
                );
                break;

            case"base64decode":
                value=bytesToHex(
                    base64ToBytes(value)
                );
                break;
        }
    }

    return value;
}