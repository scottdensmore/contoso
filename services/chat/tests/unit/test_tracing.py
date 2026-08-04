import ast
from pathlib import Path
from unittest.mock import MagicMock, call, patch

from tracing import init_tracing, trace_span


def test_trace_span_writes_nested_attributes():
    span = MagicMock()
    span_context = MagicMock()
    span_context.__enter__.return_value = span
    span_context.__exit__.return_value = False
    tracer = MagicMock()
    tracer.start_as_current_span.return_value = span_context

    with patch("tracing.oteltrace.get_tracer", return_value=tracer):
        with trace_span("unit-span") as verbose_trace:
            verbose_trace("payload", {"score": 5, "items": ["x", "y"]})
            verbose_trace("answer", "ok")

    tracer.start_as_current_span.assert_called_once_with("unit-span")
    assert call("payload.score", 5) in span.set_attribute.call_args_list
    assert call("0", "x") in span.set_attribute.call_args_list
    assert call("1", "y") in span.set_attribute.call_args_list
    assert call("answer", "ok") in span.set_attribute.call_args_list


def test_init_tracing_local_registers_prompty_tracer():
    local_trace = MagicMock()
    local_trace.tracer = "local-prompty-tracer"

    with patch("tracing.PromptyTracer", return_value=local_trace), patch(
        "tracing.Tracer.add"
    ) as mock_tracer_add:
        result = init_tracing(local_tracing=True)

    assert result is None
    mock_tracer_add.assert_called_once_with("PromptyTracer", "local-prompty-tracer")


def test_init_tracing_remote_registers_otel_tracer():
    tracer_provider = MagicMock()
    tracer_instance = MagicMock()

    with patch("tracing.Tracer.add") as mock_tracer_add, patch(
        "tracing.TracerProvider",
        return_value=tracer_provider,
    ), patch(
        "tracing.oteltrace.set_tracer_provider"
    ) as mock_set_tracer_provider, patch(
        "tracing.oteltrace.get_tracer",
        return_value=tracer_instance,
    ) as mock_get_tracer:
        result = init_tracing(local_tracing=False)

    assert result is tracer_instance
    mock_tracer_add.assert_called_once_with("OpenTelemetry", trace_span)
    mock_set_tracer_provider.assert_called_once_with(tracer_provider)
    mock_get_tracer.assert_called_once_with("prompty")

    # No exporter is configured, so no span processor is attached.
    tracer_provider.add_span_processor.assert_not_called()


def test_tracing_declares_no_optional_import_that_falls_back_to_none():
    """Guard the failure mode, not just the one instance of it.

    An `except ImportError: X = None` fallback turns an undeclared dependency
    into a silent no-op: the feature never runs, nothing raises, and the gap
    surfaces only when someone asks why the data is missing. If a future import
    here is genuinely optional, the absent case has to be observable — log it,
    or fail — rather than bound to None.
    """
    source = (
        Path(__file__).resolve().parents[2] / "src" / "api" / "tracing.py"
    ).read_text(encoding="utf-8")

    tree = ast.parse(source)
    offenders = [
        target.id
        for node in ast.walk(tree)
        if isinstance(node, ast.Try)
        for handler in node.handlers
        if _handles_import_error(handler)
        for statement in handler.body
        if isinstance(statement, ast.Assign)
        and isinstance(statement.value, ast.Constant)
        and statement.value.value is None
        for target in statement.targets
        if isinstance(target, ast.Name)
    ]

    assert offenders == [], (
        f"{offenders} fall back to None on ImportError, which hides a missing "
        f"dependency as a silently disabled feature"
    )


def _handles_import_error(handler: ast.ExceptHandler) -> bool:
    names = (
        handler.type.elts
        if isinstance(handler.type, ast.Tuple)
        else [handler.type] if handler.type is not None else []
    )
    return any(isinstance(name, ast.Name) and name.id == "ImportError" for name in names)
