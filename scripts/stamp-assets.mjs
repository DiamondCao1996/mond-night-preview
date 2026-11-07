import {readFile,writeFile,readdir} from 'node:fs/promises';
const stamp=process.argv[2];if(!/^[a-f0-9]{40}$/.test(stamp||''))throw Error('Pass the full feature commit SHA');
const root=new URL('../',import.meta.url);
async function walk(dir){const files=[];for(const entry of await readdir(dir,{withFileTypes:true})){const url=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())files.push(...await walk(url));else if(/\.(js|css)$/.test(entry.name))files.push(url);}return files;}
for(const file of [new URL('index.html',root),...await walk(new URL('assets/',root))]){
 const source=await readFile(file,'utf8');
 // Stamp static imports, dynamic imports, Vite dependency arrays and CSS references.
 let next=source.replace(/(["'])([^"'\s<>]+\.(?:js|css))(?:\?v=[a-f0-9]+)?\1/g,(all,quote,path)=>`${quote}${path}?v=${stamp}${quote}`);
 if(file.pathname.endsWith('/index.html'))next=next.replace(/window\.__MOND_V = '[^']+'/,`window.__MOND_V = '${stamp}'`);
 if(next!==source)await writeFile(file,next);
}
