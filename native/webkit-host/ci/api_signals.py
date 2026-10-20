"""TEMPORARY (cloud/webkit-feel): GObject signal signatures from a GIR file."""
import sys
import xml.etree.ElementTree as E
C = '{http://www.gtk.org/introspection/core/1.0}'
G = '{http://www.gtk.org/introspection/glib/1.0}'
for cls in E.parse(sys.argv[1]).getroot().iter(C + 'class'):
    for signal in cls.findall(G + 'signal'):
        params = []
        for p in signal.findall(f'{C}parameters/{C}parameter'):
            t = p.find(C + 'type')
            params.append(f"{p.get('name')}:{t.get('name') if t is not None else '?'}")
        r = signal.find(f'{C}return-value/{C}type')
        print(cls.get('name'), signal.get('name'), params, '->', r.get('name') if r is not None else '?')
