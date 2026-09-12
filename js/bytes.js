export const ALPHABETS={};

for(let b=2;b<=64;b++)
    ALPHABETS[b]="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_".slice(0,b);

ALPHABETS[58]="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
ALPHABETS[64]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export const textToBytes=s=>new TextEncoder().encode(s);

export const bytesToText=b=>
    new TextDecoder("utf-8",{fatal:true}).decode(b);

export const bytesToHex=b=>
    [...b].map(x=>x.toString(16).padStart(2,"0")).join("");

export function hexToBytes(s){
    s=s.replace(/[\s:]/g,"");

    if(!/^[0-9a-fA-F]*$/.test(s)||s.length%2)
        throw Error("Invalid hex.");

    let a=new Uint8Array(s.length/2);

    for(let i=0;i<a.length;i++)
        a[i]=parseInt(s.slice(i*2,i*2+2),16);

    return a;
}

export const bytesToBinary=b=>
    [...b].map(x=>x.toString(2).padStart(8,"0")).join(" ");

export function binaryToBytes(s){
    let p=s.trim().split(/[\s,]+/).filter(Boolean);

    return new Uint8Array(
        p.map(x=>{
            if(!/^[01]{1,8}$/.test(x))
                throw Error("Invalid binary byte.");

            return parseInt(x,2)
        })
    )
}

export const bytesToDecimal=b=>
    [...b].join(" ");

export function decimalToBytes(s){
    let p=s.trim().split(/[\s,]+/).filter(Boolean);

    return new Uint8Array(
        p.map(x=>{
            let n=Number(x);

            if(!Number.isInteger(n)||n<0||n>255)
                throw Error("Decimal bytes must be 0–255.");

            return n
        })
    )
}

export const bytesToList=b=>
    [...b].join(", ");

export function listToBytes(s){
    let p=s
        .replace(/^\[|\]$/g,"")
        .trim()
        .split(/[\s,]+/)
        .filter(Boolean);

    return new Uint8Array(
        p.map(x=>{
            let n=Number(x);

            if(!/^\d+$/.test(x)||n>255)
                throw Error("Invalid byte list.");

            return n
        })
    )
}

export function bytesToBase(b,base){
    if(!b.length)return "";

    let alpha=ALPHABETS[base],
        n=0n;

    for(let x of b)
        n=(n<<8n)|BigInt(x);

    let out="",
        B=BigInt(base);

    while(n){
        out=alpha[Number(n%B)]+out;
        n/=B
    }

    return out
}

export function baseToBytes(s,base){
    let alpha=ALPHABETS[base],
        n=0n,
        B=BigInt(base);

    s=s.trim();

    for(let c of s){
        let i=alpha.indexOf(c);

        if(i<0)
            throw Error(`Invalid character "${c}" for Base ${base}.`);

        n=n*B+BigInt(i)
    }

    if(!n)
        return new Uint8Array([0]);

    let a=[];

    while(n){
        a.push(Number(n&255n));
        n>>=8n
    }

    return new Uint8Array(a.reverse())
}

export function decode(v,f,base=16){
    switch(f){
        case"text":
            return textToBytes(v);

        case"bytes":
            return listToBytes(v);

        case"hex":
            return hexToBytes(v);

        case"binary":
            return binaryToBytes(v);

        case"decimal":
            return decimalToBytes(v);

        case"base":
            return baseToBytes(v,base);

        case"base64":
            return base64ToBytes(v);
    }
}

export function encode(b,f,base=16){
    switch(f){
        case"text":
            return bytesToText(b);

        case"bytes":
            return bytesToList(b);

        case"hex":
            return bytesToHex(b);

        case"binary":
            return bytesToBinary(b);

        case"decimal":
            return bytesToDecimal(b);

        case"base":
            return bytesToBase(b,base);

        case"base64":
            return bytesToBase64(b);
    }
}

export function bytesToBase64(b){
    let s="";

    for(let x of b)
        s+=String.fromCharCode(x);

    return btoa(s)
}

export function base64ToBytes(s){
    let x=atob(s.trim()),
        b=new Uint8Array(x.length);

    for(let i=0;i<x.length;i++)
        b[i]=x.charCodeAt(i);

    return b
}