"""Deterministic allowlisted draft ZIPs. Run through the JS validator first."""
import hashlib, json, pathlib, stat, sys, zipfile
root = pathlib.Path(__file__).resolve().parent.parent
output = pathlib.Path(sys.argv[1]).resolve()
portal_records = '--portal-records' in sys.argv[2:]
if any(arg != '--portal-records' for arg in sys.argv[2:]):
    raise ValueError('Unknown packaging option')
record_names = {'resonant-quantum-mechanics': 'app-6aa6f57730308191906618fb867f004e', 'waveengine': 'app-6aa6f7b0b20c819192af846d6e6ee4dd', 'robotics-lab': 'app-6aa6f7837d588191b63262aee7813039'}
products = {'resonant-quantum-mechanics': 'quantum-59c0e77394f41197.png', 'waveengine': 'wave-dab197da82677d4.png', 'robotics-lab': 'robotics-54c5a66443a9c9ed.png'}
output.mkdir(parents=True, exist_ok=True)
for name, asset in products.items():
    base = root / 'connectors' / 'chatgpt' / name
    files = ['plugin.json', 'mcp.json', 'README.md', 'PRIVACY.md', 'LICENSE', 'NOTICE', 'assets/PROVENANCE.md', 'assets/' + asset, 'skills/' + name + '/SKILL.md']
    version = json.loads((base / 'plugin.json').read_text())['version']
    target = output / (name + '-' + version + ('-portal-record' if portal_records else '-draft') + '.zip')
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for relative in sorted(files):
            source = base / relative
            if source.is_symlink() or not source.resolve().is_relative_to(base.resolve()) or not source.is_file():
                raise ValueError('Unsafe package file: ' + relative)
            info = zipfile.ZipInfo(relative, date_time=(2026, 10, 2, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            content = source.read_bytes()
            if portal_records and relative == 'plugin.json':
                manifest = json.loads(content)
                assert manifest['name'] == name
                manifest['name'] = record_names[name]
                content = (json.dumps(manifest, indent=2, ensure_ascii=False) + '\n').encode('utf-8')
            archive.writestr(info, content, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    with zipfile.ZipFile(target) as archive:
        assert archive.testzip() is None
        assert sorted(archive.namelist()) == sorted(files)
    print(json.dumps({'file': str(target), 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'files': sorted(files), 'portal_record_name': record_names[name] if portal_records else None, 'submission_ready': False}))
