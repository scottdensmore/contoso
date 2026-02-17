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


def test_init_tracing_remote_registers_otel_exporter():
    tracer_provider = MagicMock()
    cloud_exporter = MagicMock()
    batch_processor = MagicMock()
    tracer_instance = MagicMock()

    with patch("tracing.Tracer.add") as mock_tracer_add, patch(
        "tracing.TracerProvider",
        return_value=tracer_provider,
    ), patch(
        "tracing.CloudTraceSpanExporter",
        return_value=cloud_exporter,
    ), patch(
        "tracing.BatchSpanProcessor",
        return_value=batch_processor,
    ) as mock_batch_span_processor, patch(
        "tracing.oteltrace.set_tracer_provider"
    ) as mock_set_tracer_provider, patch(
        "tracing.oteltrace.get_tracer",
        return_value=tracer_instance,
    ) as mock_get_tracer:
        result = init_tracing(local_tracing=False)

    assert result is tracer_instance
    mock_tracer_add.assert_called_once_with("OpenTelemetry", trace_span)
    mock_set_tracer_provider.assert_called_once_with(tracer_provider)
    mock_batch_span_processor.assert_called_once_with(cloud_exporter)
    tracer_provider.add_span_processor.assert_called_once_with(batch_processor)
    mock_get_tracer.assert_called_once_with("prompty")
