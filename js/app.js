import {decode,encode,bytesToHex,bytesToBase64} from "./bytes.js";
import {xorFromValues} from "./xor.js";
import {digest,hmac} from "./hash.js";
import {transform} from "./ciphers.js";
import {analyze} from "./analysis.js";
import {randomBytes,formatRandom,uuid,probablePrime} from "./random.js";
import {runPipeline} from "./pipeline.js";

const $=id=>document.getElementById(id);
const formats=[["text","UTF-8 Text"],["bytes","Bytes"],["hex","Hex"],["binary","Binary"],["decimal","Decimal"],["base","Base N"]];

function populate(id){
    $(id).innerHTML=formats.map(([v,t])=>`<option value="${v}">${t}</option>`).join("")
}

populate("convFrom");
populate("convTo");
$("convTo").value="hex";

for(let id of ["convFromBase","convToBase"])
    for(let b=2;b<=64;b++)
        $(id).innerHTML+=`<option value="${b}" ${b===16?"selected":""}>Base ${b}</option>`;

function baseToggle(id,b){
    $(id).style.display=$(id.replace("Base","")).value==="base"?"block":"none"
}

$("convFrom").onchange=()=>{
    baseToggle("convFromBase");
    convert()
};

$("convTo").onchange=()=>{
    baseToggle("convToBase");
    convert()
};

baseToggle("convFromBase");
baseToggle("convToBase");

function convert(){
    try{
        let b=decode(
            $("convInput").value,
            $("convFrom").value,
            +$("convFromBase").value
        );

        $("convOutput").value=encode(
            b,
            $("convTo").value,
            +$("convToBase").value
        );

        $("convError").textContent=""
    }catch(e){
        $("convOutput").value="";
        $("convError").textContent=e.message
    }
}

$("convInput").oninput=convert;
$("convFromBase").onchange=convert;
$("convToBase").onchange=convert;

$("convSwap").onclick=()=>{
    let f=$("convFrom").value,
        t=$("convTo").value,
        fb=$("convFromBase").value,
        tb=$("convToBase").value;

    $("convFrom").value=t;
    $("convTo").value=f;
    $("convFromBase").value=tb;
    $("convToBase").value=fb;

    baseToggle("convFromBase");
    baseToggle("convToBase");
    convert()
};

$("convClear").onclick=()=>{
    $("convInput").value="";
    convert()
};

$("convCopy").onclick=()=>{
    navigator.clipboard.writeText($("convOutput").value)
};

document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".tool").forEach(x=>x.classList.remove("active-tool"));
    t.classList.add("active");
    $(t.dataset.tool).classList.add("active-tool")
});

$("bitRun").onclick=()=>{
    try{
        let a=decode($("bitA").value,$("bitFormat").value),
            b=decode($("bitB").value,$("bitFormat").value);

        if(a.length!==b.length)
            throw Error("A and B must have equal byte length.");

        let op=$("bitOp").value,
            r=new Uint8Array(a.length);

        for(let i=0;i<r.length;i++){
            let x=a[i],y=b[i];

            r[i]=
                op==="XOR"?x^y:
                op==="AND"?x&y:
                op==="OR"?x|y:
                op==="XNOR"?~(x^y):
                op==="NAND"?~(x&y):
                ~(x|y)
        }

        $("bitResult").textContent=bytesToHex(r)
    }catch(e){
        $("bitResult").textContent="ERROR: "+e.message
    }
};

$("hashRun").onclick=async()=>{
    try{
        $("hashResult").textContent=
            await digest(
                $("hashInput").value,
                $("hashAlgo").value,
                $("hashInputType").value
            )
    }catch(e){
        $("hashResult").textContent="ERROR: "+e.message
    }
};

$("hashCopy").onclick=()=>{
    navigator.clipboard.writeText($("hashResult").textContent)
};

$("cipherRun").onclick=()=>{
    try{
        $("cipherOutput").value=
            transform(
                $("cipherType").value,
                $("cipherMode").value,
                $("cipherInput").value,
                $("cipherKey").value
            );

        $("cipherError").textContent=""
    }catch(e){
        $("cipherError").textContent=e.message
    }
};

$("xorRun").onclick=()=>{
    try{
        let r=xorFromValues(
            $("xorA").value,
            $("xorB").value,
            $("xorFormat").value,
            $("xorRepeat").checked
        );

        $("xorResult").textContent=bytesToHex(r);

        $("xorTable").innerHTML=
            r.map((x,i)=>
                `<div class="row">
                    <span>${String(i).padStart(4,"0")}</span>
                    <span>${x.toString(16).padStart(2,"0")}</span>
                    <span>${x.toString(2).padStart(8,"0")}</span>
                    <span>bit ${i*8}–${i*8+7}</span>
                    <span></span>
                </div>`
            ).join("")
    }catch(e){
        $("xorResult").textContent="ERROR: "+e.message;
        $("xorTable").innerHTML=""
    }
};

$("xorCopy").onclick=()=>{
    navigator.clipboard.writeText($("xorResult").textContent)
};

$("analysisRun").onclick=()=>{
    try{
        let a=analyze(
            $("analysisInput").value,
            $("analysisType").value
        );

        $("analysisStats").innerHTML=`
            <div class="stat">
                <b>${a.bytes}</b>
                <span>BYTES</span>
            </div>
            <div class="stat">
                <b>${a.unique}</b>
                <span>UNIQUE BYTES</span>
            </div>
            <div class="stat">
                <b>${a.entropy.toFixed(4)}</b>
                <span>ENTROPY / 8</span>
            </div>
            <div class="stat">
                <b>${a.bytes?((a.entropy/8)*100).toFixed(1):0}%</b>
                <span>RELATIVE ENTROPY</span>
            </div>
        `;

        $("freq").innerHTML=
            a.frequency.map((n,i)=>
                `<div class="bar"
                    title="${i.toString(16).padStart(2,"0")}: ${n}"
                    style="height:${a.bytes?Math.max(1,n/a.bytes*180):1}px">
                </div>`
            ).join("")
    }catch(e){
        $("analysisStats").innerHTML=
            `<div class="stat">
                <b>ERROR</b>
                <span>${e.message}</span>
            </div>`
    }
};

$("randRun").onclick=()=>{
    let n=Math.min(
        4096,
        Math.max(1,+$("randLength").value||32)
    );

    $("randResult").textContent=
        formatRandom(
            randomBytes(n),
            $("randFormat").value
        )
};

$("randCopy").onclick=()=>{
    navigator.clipboard.writeText($("randResult").textContent)
};

$("uuidRun").onclick=()=>{
    $("numberResult").textContent=uuid()
};

$("primeRun").onclick=()=>{
    $("numberResult").textContent=
        probablePrime(128).toString(16)
};

let selectedFile=null;

$("fileInput").onchange=e=>{
    selectedFile=e.target.files[0];
    $("fileName").textContent=
        selectedFile?.name||"No file selected"
};

$("fileRun").onclick=async()=>{
    if(!selectedFile)return;

    $("fileResult").textContent=
        await fileOutput(
            await selectedFile.arrayBuffer(),
            $("fileView").value
        )
};

$("fileHash").onclick=async()=>{
    if(!selectedFile)return;

    $("fileResult").textContent=
        await digest(
            await selectedFile.arrayBuffer(),
            "SHA-256",
            "bytes"
        )
};

async function fileOutput(buf,type){
    let b=new Uint8Array(buf);

    if(type==="hex")
        return bytesToHex(b);

    if(type==="base64")
        return bytesToBase64(b);

    if(type==="binary")
        return [...b]
            .map(x=>x.toString(2).padStart(8,"0"))
            .join(" ");

    try{
        return new TextDecoder("utf-8",{fatal:true}).decode(b)
    }catch{
        return "[not valid UTF-8]"
    }
}

$("fileCopy").onclick=()=>{
    navigator.clipboard.writeText($("fileResult").textContent)
};

const stages=[];

$("addStage").onclick=()=>{
    stages.push($("stageType").value);
    renderStages()
};

function renderStages(){
    $("stages").innerHTML=
        stages.map((s,i)=>
            `<div class="stage">
                ${s}
                <button onclick="removeStage(${i})">×</button>
            </div>`
        ).join("")
}

window.removeStage=i=>{
    stages.splice(i,1);
    renderStages()
};

$("pipeRun").onclick=async()=>{
    try{
        $("pipeResult").textContent=
            await runPipeline(
                $("pipeInput").value,
                stages
            )
    }catch(e){
        $("pipeResult").textContent=
            "ERROR: "+e.message
    }
};

$("hmacRun").onclick=async()=>{
    try{
        $("hmacResult").textContent=
            await hmac(
                $("hmacData").value,
                $("hmacKey").value,
                $("hmacAlgo").value
            )
    }catch(e){
        $("hmacResult").textContent=
            "ERROR: "+e.message
    }
};

$("jwtRun").onclick=()=>{
    try{
        let p=$("jwtInput").value.split(".");

        if(p.length!==3)
            throw Error("JWT must have three parts.");

        let dec=x=>
            JSON.parse(
                new TextDecoder().decode(
                    Uint8Array.from(
                        atob(
                            x.replace(/-/g,"+")
                             .replace(/_/g,"/")
                        ),
                        c=>c.charCodeAt(0)
                    )
                )
            );

        $("jwtResult").textContent=
            JSON.stringify({
                header:dec(p[0]),
                payload:dec(p[1]),
                signature:p[2]
            },null,2)
    }catch(e){
        $("jwtResult").textContent=
            "ERROR: "+e.message
    }
};

const modal=$("commandModal"),
      ci=$("commandInput"),
      cl=$("commandList");

const tools=
    [...document.querySelectorAll(".tab")]
    .map(x=>[x.dataset.tool,x.textContent]);

function openCmd(){
    modal.classList.add("show");
    ci.value="";
    ci.focus();
    renderCmd("")
}

function renderCmd(q){
    cl.innerHTML=
        tools
        .filter(x=>
            x[0].includes(q.toLowerCase())||
            x[1].toLowerCase().includes(q.toLowerCase())
        )
        .map(x=>
            `<div class="cmd" data-tool="${x[0]}">
                ${x[1]}
            </div>`
        )
        .join("");

    cl.querySelectorAll(".cmd")
        .forEach(x=>
            x.onclick=()=>{
                document
                    .querySelector(
                        `.tab[data-tool="${x.dataset.tool}"]`
                    )
                    .click();

                modal.classList.remove("show")
            }
        )
}

$("commandBtn").onclick=openCmd;

ci.oninput=()=>{
    renderCmd(ci.value)
};

modal.onclick=e=>{
    if(e.target===modal)
        modal.classList.remove("show")
};

document.onkeydown=e=>{
    if(
        (e.ctrlKey||e.metaKey)&&
        e.key.toLowerCase()==="k"
    ){
        e.preventDefault();
        openCmd()
    }

    if(e.key==="Escape")
        modal.classList.remove("show")
};