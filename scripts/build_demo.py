#!/usr/bin/env python3
"""Build the exact single-file Demo from its local, editable sources."""
import argparse, hashlib
from pathlib import Path

MARKER='/*__LINGOCLOUD_STYLE__*/'
def assemble(project):
    project=Path(project)
    shell=(project/'source/shell.html').read_bytes().decode('utf-8')
    css=(project/'source/styles.css').read_bytes().decode('utf-8')
    app=(project/'source/app.js').read_bytes().decode('utf-8')
    if shell.count(MARKER)!=1:raise ValueError('Expected one stylesheet marker in source/shell.html')
    common=(project/'source/editions.js').read_text()
    return (shell.replace(MARKER,css,1)+'<script>'+app+'</script><script>'+common+'</script></body></html>').encode('utf-8')
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project',required=True,type=Path,help='A restored Demo directory containing source/')
    parser.add_argument('--output',type=Path,help='Defaults to PROJECT/index.html')
    args=parser.parse_args();result=assemble(args.project);out=args.output or args.project/'index.html'
    out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(result)
    inkcss=(args.project/'source/ink.css').read_text();inkjs=(args.project/'source/ink-turn.js').read_text()+'\n'+(args.project/'source/ink.js').read_text()
    ink=result.decode().replace('</style>',inkcss+'</style>',1).replace('<body class="theme-paper">','<body class="theme-paper ink-edition">',1)
    ink=ink.replace('data-edition-link aria-current="page">暖光星空','data-edition-link>暖光星空').replace('data-edition-link>水墨纸书 ↗','data-edition-link aria-current="page">水墨纸书')
    ink=ink.replace('<script>'+ (args.project/'source/editions.js').read_text(),'<script>'+inkjs+'</script><script>'+(args.project/'source/editions.js').read_text(),1)
    ink=ink.replace('<title>','<title>水墨纸书 · ',1)
    ink=ink.replace("document.body.className='theme-'+s.theme;","document.body.className='theme-'+s.theme+' ink-edition';").replace("document.body.className='theme-'+b.dataset.theme;","document.body.className='theme-'+b.dataset.theme+' ink-edition';")
    (out.parent/'ink.html').write_text(ink)
    print(str(out.resolve()));print('SHA-256 '+hashlib.sha256(result).hexdigest())
if __name__=='__main__':main()
