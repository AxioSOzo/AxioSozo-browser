"""Engine plug-ins for the Linux GUI harness (scripts/gui_test.py).

One module per engine in this package, each exporting `ENGINE`, an instance
of a `GuiEngine` subclass. The harness owns Xvfb, the AxioSozo (Zen/Gecko)
process, the owned profile, the loopback fixture server, Marionette, xdotool
and screenshots; an engine only decides how a fixture page is shown in a tab
that this engine renders, and how to assert that it really rendered there.

Gecko is implemented. Chromium (cloud/linux-cef) and WebKit (cloud/webkit-host)
are registered stubs that report BLOCKED_ENV until their workstreams fill in
`prepare`, `show` and `assert_rendered` (see docs/LINUX.md, "GUI harness").
"""
import importlib
import pkgutil


class EngineUnavailable(RuntimeError):
    """The engine cannot run in this environment (reported as BLOCKED_ENV)."""


class GuiEngine:
    #: --engine name
    name = 'base'
    #: Workstream that owns this plug-in.
    owner = ''

    def browser_environment(self, harness):
        """Extra environment for the AxioSozo process (for example the engine
        host binary). Never disables TLS, sandboxes or origin isolation."""
        return {}

    def prepare(self, harness):
        """Called after the browser window is up and Marionette is connected.
        Raise EngineUnavailable when the engine cannot run here."""

    def show(self, harness, url):
        """Show `url` in the selected tab, rendered by this engine. Returns a
        dict of evidence (tab identity, process type, timings)."""
        raise EngineUnavailable(self.name + ' engine plug-in is not implemented yet (owner: ' + self.owner + ')')

    def assert_rendered(self, harness, expected_title_prefix):
        """Assert the shown page rendered in this engine; return evidence or
        raise AssertionError."""
        raise EngineUnavailable(self.name + ' engine plug-in is not implemented yet (owner: ' + self.owner + ')')

    def content_title(self, harness):
        """The page title as the engine reports it (used by input scenarios)."""
        raise EngineUnavailable(self.name + ' engine plug-in is not implemented yet (owner: ' + self.owner + ')')


def engines():
    """{name: engine} for every module in this package."""
    found = {}
    for module in pkgutil.iter_modules(__path__):
        engine = getattr(importlib.import_module(__name__ + '.' + module.name), 'ENGINE', None)
        if isinstance(engine, GuiEngine):
            found[engine.name] = engine
    return dict(sorted(found.items()))
