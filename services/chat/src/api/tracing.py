import contextlib

from opentelemetry import trace as oteltrace
from opentelemetry.sdk.trace import TracerProvider
from prompty.tracer import PromptyTracer, Tracer

_tracer = "prompty"

@contextlib.contextmanager
def trace_span(name: str):    
    tracer = oteltrace.get_tracer(_tracer)    
    with tracer.start_as_current_span(name) as span:        
        def verbose_trace(key, value):            
            if isinstance(value, dict):             
                for k, v in value.items():                  
                    verbose_trace(f"{key}.{k}", v)        
            elif isinstance(value, (list, tuple)):
                for index, item in enumerate(value):
                    span.set_attribute(f"{index}", str(item))  
            else:                
                span.set_attribute(f"{key}", value)     
        yield verbose_trace


def init_tracing(local_tracing: bool = False):
    """
    Initialize tracing for the application
    If local_tracing is True, use the PromptyTracer
    If remote_tracing is True, use the OpenTelemetry tracer
    If remote_tracing is not specified, defaults to using the OpenTelemetry tracer only if local_tracing is False
    """

    if local_tracing:
        local_trace = PromptyTracer()
        Tracer.add("PromptyTracer", local_trace.tracer)
    else:
        Tracer.add("OpenTelemetry", trace_span)

        # No span exporter is attached: nothing in this repo collects traces.
        # Add one here when there is somewhere to send spans.
        tracer_provider = TracerProvider()
        oteltrace.set_tracer_provider(tracer_provider)

        return oteltrace.get_tracer(_tracer)
