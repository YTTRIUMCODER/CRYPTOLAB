import {
    bytesToHex,
    bytesToBinary,
    bytesToDecimal,
    bytesToBase64
} from "./bytes.js";

export function randomBytes(n){
    let b=new Uint8Array(n);
    crypto.getRandomValues(b);
    return b;
}

export function formatRandom(b,f){
    if(f==="hex")
        return bytesToHex(b);

    if(f==="binary")
        return bytesToBinary(b);

    if(f==="decimal")
        return bytesToDecimal(b);

    return bytesToBase64(b);
}

export function uuid(){
    return crypto.randomUUID();
}

export function randomBigInt(bits){
    let n=0n;

    let b=randomBytes(
        Math.ceil(bits/8)
    );

    b[0]&=255>>(8-(bits%8||8));

    for(let x of b)
        n=(n<<8n)|BigInt(x);

    return n|1n;
}

export function probablePrime(bits=128){
    while(true){
        let n=randomBigInt(bits)|1n;

        if(n%3n===0n||n%5n===0n)
            continue;

        let ok=true;

        for(
            let d=7n;
            d*d<=n&&d<100000n;
            d+=2n
        ){
            if(n%d===0n){
                ok=false;
                break;
            }
        }

        if(ok)
            return n;
    }
}