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
    return (shell.replace(MARKER,css,1)+'<script>'+app+'</script></body></html>').encode('utf-8')
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project',required=True,type=Path,help='A restored Demo directory containing source/')
    parser.add_argument('--output',type=Path,help='Defaults to PROJECT/index.html')
    args=parser.parse_args();result=assemble(args.project);out=args.output or args.project/'index.html'
    out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(result)
    print(str(out.resolve()));print('SHA-256 '+hashlib.sha256(result).hexdigest())
if __name__=='__main__':main()
