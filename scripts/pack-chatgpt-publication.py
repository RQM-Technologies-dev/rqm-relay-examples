"""Deterministic allowlisted draft ZIPs. Run through the JS validator first."""
import hashlib, json, pathlib, stat, sys, zipfile
root = pathlib.Path(__file__).resolve().parent.parent
output = pathlib.Path(sys.argv[1]).resolve()
products = {'resonant-quantum-mechanics': 'quantum-59c0e77394f41197.png', 'waveengine': 'wave-dab197da82677d4.png', 'robotics-lab': 'robotics-54c5a66443a9c9ed.png'}
output.mkdir(parents=True, exist_ok=True)
for name, asset in products.items():
    base = root / 'connectors' / 'chatgpt' / name
    files = ['plugin.json', 'mcp.json', 'README.md', 'PRIVACY.md', 'LICENSE', 'NOTICE', 'assets/PROVENANCE.md', 'assets/' + asset, 'skills/' + name + '/SKILL.md']
    version = json.loads((base / 'plugin.json').read_text())['version']
    target = output / (name + '-' + version + '-draft.zip')
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for relative in sorted(files):
            source = base / relative
            if source.is_symlink() or not source.resolve().is_relative_to(base.resolve()) or not source.is_file():
                raise ValueError('Unsafe package file: ' + relative)
            info = zipfile.ZipInfo(relative, date_time=(2026, 10, 2, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            archive.writestr(info, source.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    with zipfile.ZipFile(target) as archive:
        assert archive.testzip() is None
        assert sorted(archive.namelist()) == sorted(files)
    print(json.dumps({'file': str(target), 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'files': sorted(files), 'submission_ready': False}))
