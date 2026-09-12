import {decode,bytesToHex} from "./bytes.js";

export function xor(a,b,repeat=false){
    if(!a.length||!b.length)
        throw Error("Both inputs are required.");

    if(!repeat&&a.length!==b.length)
        throw Error("Inputs must have equal byte length.");

    let n=repeat
        ?Math.max(a.length,b.length)
        :a.length;

    let r=new Uint8Array(n);

    for(let i=0;i<n;i++)
        r[i]=a[i%a.length]^b[i%b.length];

    return r;
}

export function xorFromValues(a,b,format,repeat){
    return xor(
        decode(a,format),
        decode(b,format),
        repeat
    );
}

export {bytesToHex};