#!/usr/bin/env node
/** Run once; never ship the private key or replace an existing key silently. */
import {webcrypto} from 'node:crypto';
import {mkdir,writeFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const publicPath=resolve(root,'docs/public-key.json');
const privatePath=resolve(process.argv[2]||resolve(root,'../output/dogana-booleana-private/chiave-privata-docente.json'));
if(privatePath===root||privatePath.startsWith(root+'/'))throw Error('La chiave privata deve restare fuori dal repository pubblico.');
for(const path of [publicPath,privatePath]){try{await access(path);throw Error(`Esiste già: ${path}. Nessuna chiave è stata cambiata.`);}catch(error){if(error.code!=='ENOENT')throw error;}}
const pair=await webcrypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:3072,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']);
const publicJwk=await webcrypto.subtle.exportKey('jwk',pair.publicKey),privateJwk=await webcrypto.subtle.exportKey('jwk',pair.privateKey);
await mkdir(dirname(privatePath),{recursive:true,mode:0o700});
await writeFile(privatePath,JSON.stringify(privateJwk,null,2)+'\n',{flag:'wx',mode:0o600});
await writeFile(publicPath,JSON.stringify(publicJwk,null,2)+'\n',{flag:'wx'});
console.log(`Chiave pubblica: ${publicPath}\nChiave privata separata: ${privatePath}`);
