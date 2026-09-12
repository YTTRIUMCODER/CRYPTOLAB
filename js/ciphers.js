function caesar(s,k,dec=false){
    k=((Number(k)%26)+26)%26;

    if(dec)
        k=-k;

    return [...s].map(c=>{
        let n=c.charCodeAt(0);

        if(n>=65&&n<=90)
            return String.fromCharCode((n-65+k+26)%26+65);

        if(n>=97&&n<=122)
            return String.fromCharCode((n-97+k+26)%26+97);

        return c;
    }).join("");
}

function atbash(s){
    return [...s].map(c=>{
        let n=c.charCodeAt(0);

        if(n>=65&&n<=90)
            return String.fromCharCode(90-(n-65));

        if(n>=97&&n<=122)
            return String.fromCharCode(122-(n-97));

        return c;
    }).join("");
}

function vig(s,key,dec=false){
    key=key.toUpperCase().replace(/[^A-Z]/g,"");

    if(!key)
        throw Error("Vigenere key required.");

    let j=0;

    return [...s].map(c=>{
        let n=c.charCodeAt(0);

        if(!/[A-Za-z]/.test(c))
            return c;

        let base=n>=97?97:65;
        let k=key.charCodeAt(j++%key.length)-65;

        return String.fromCharCode(
            (n-base+(dec?-k:k)+26)%26+base
        );
    }).join("");
}

function affine(s,dec=false){
    let a=5,
        b=8,
        inv=21;

    return [...s].map(c=>{
        let n=c.toUpperCase().charCodeAt(0)-65;

        if(n<0||n>25)
            return c;

        let x=dec
            ?inv*(n-b)
            :a*n+b;

        return String.fromCharCode(x%26+65);
    }).join("");
}

function rail(s,key,dec=false){
    let n=Math.max(2,Number(key));

    if(n>=s.length)
        return s;

    if(!dec){
        let rows=Array.from({length:n},()=>[]),
            r=0,
            d=1;

        for(let c of s){
            rows[r].push(c);

            if(r===0)
                d=1;

            if(r===n-1)
                d=-1;

            r+=d;
        }

        return rows.flat().join("");
    }

    let pattern=[],
        r=0,
        d=1;

    for(let i=0;i<s.length;i++){
        pattern.push(r);

        if(r===0)
            d=1;

        if(r===n-1)
            d=-1;

        r+=d;
    }

    let counts=Array(n).fill(0);

    pattern.forEach(x=>counts[x]++);

    let rows=[],
        p=0;

    for(let c of counts){
        rows.push(
            s.slice(p,p+c).split("")
        );

        p+=c;
    }

    return pattern
        .map(x=>rows[x].shift())
        .join("");
}

function columnar(s,key,dec=false){
    let k=String(key);

    if(!k)
        throw Error("Key required.");

    if(!dec){
        let rows=Array.from(
            {length:Math.ceil(s.length/k.length)},
            ()=>[]
        );

        [...s].forEach((c,i)=>
            rows[Math.floor(i/k.length)].push(c)
        );

        let order=[...k]
            .map((c,i)=>[c,i])
            .sort(
                (a,b)=>
                    a[0].localeCompare(b[0])||
                    a[1]-b[1]
            );

        return order
            .map(([,i])=>
                rows.map(r=>r[i]||"").join("")
            )
            .join("");
    }

    let cols=Math.ceil(s.length/k.length),
        short=cols*k.length-s.length;

    let order=[...k]
        .map((c,i)=>[c,i])
        .sort(
            (a,b)=>
                a[0].localeCompare(b[0])||
                a[1]-b[1]
        );

    let lens=Array(k.length).fill(cols);

    for(let i=k.length-short;i<k.length;i++)
        if(i>=0)
            lens[i]--;

    let col=Array(k.length),
        p=0;

    for(let [,i] of order){
        col[i]=s
            .slice(p,p+lens[i])
            .split("");

        p+=lens[i];
    }

    let out="";

    for(let r=0;r<cols;r++)
        for(let c=0;c<k.length;c++)
            if(col[c][r])
                out+=col[c][r];

    return out;
}

export function transform(type,mode,s,key){
    switch(type){
        case"Caesar":
            return caesar(s,key,mode==="dec");

        case"ROT13":
            return caesar(s,13,false);

        case"Atbash":
            return atbash(s);

        case"Vigenere":
            return vig(s,key,mode==="dec");

        case"Affine":
            return affine(s,mode==="dec");

        case"Rail Fence":
            return rail(s,key,mode==="dec");

        case"Columnar Transposition":
            return columnar(s,key,mode==="dec");
    }
}