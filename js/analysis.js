import {decode} from "./bytes.js";

export function analyze(v,type){
    let b=decode(v,type==="base64"?"base64":type);
    let f=Array(256).fill(0);

    for(let x of b)
        f[x]++;

    let e=0;

    for(let n of f)
        if(n){
            let p=n/b.length;
            e-=p*Math.log2(p);
        }

    return {
        bytes:b.length,
        unique:f.filter(Boolean).length,
        entropy:b.length?e:0,
        frequency:f
    };
}