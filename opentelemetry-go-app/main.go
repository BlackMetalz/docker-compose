package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	// "go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var tracer trace.Tracer

func initProvider() (func(context.Context) error, error) {
	ctx := context.Background()

	// Get collector endpoint from environment variable or use default
	endpoint := os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
	if endpoint == "" {
		endpoint = "localhost:4317"
	}

	// Set up a connection to the collector
	conn, err := grpc.DialContext(ctx, endpoint,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock())
	if err != nil {
		return nil, fmt.Errorf("failed to create gRPC connection to collector: %w", err)
	}

	// Set up a trace exporter
	traceExporter, err := otlptracegrpc.New(ctx,
		otlptracegrpc.WithGRPCConn(conn),
		otlptracegrpc.WithInsecure(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create trace exporter: %w", err)
	}

	// Register the trace exporter with a TracerProvider using a batch
	// span processor to aggregate spans before export.
	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(traceExporter)
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(newResource()),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
	)
	otel.SetTracerProvider(tracerProvider)

	// Set global propagator to tracecontext (the default is no-op)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	))

	// Create a tracer
	tracer = otel.GetTracerProvider().Tracer("demo-service")

	// Return a function that can be called to clean up resources
	return tracerProvider.Shutdown, nil
}

func newResource() *resource.Resource {
	serviceName := os.Getenv("SERVICE_NAME")
	if serviceName == "" {
		serviceName = "demo-service"
	}

	r, _ := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName(serviceName),
			semconv.ServiceVersion("0.1.0"),
			attribute.String("environment", "demo"),
		),
	)
	return r
}

// Simulate database call
func databaseCall(ctx context.Context) error {
	_, span := tracer.Start(ctx, "database.query", trace.WithAttributes(
		semconv.DBSystemPostgreSQL,
		semconv.DBName("users"),
		semconv.DBStatement("SELECT * FROM users"),
	))
	defer span.End()

	// Simulate database operation
	time.Sleep(100 * time.Millisecond)

	// 10% chance of error for demonstration
	if time.Now().UnixNano()%10 == 0 {
		err := fmt.Errorf("database connection error")
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

// Simulate external API call
func externalAPICall(ctx context.Context) error {
	ctx, span := tracer.Start(ctx, "external.api.request", trace.WithAttributes(
		attribute.String("api.name", "payment-service"),
		attribute.String("api.endpoint", "/api/v1/process"),
	))
	defer span.End()

	// Create HTTP client with tracing
	client := http.Client{
		Transport: otelhttp.NewTransport(http.DefaultTransport),
	}

	// External API call
	req, _ := http.NewRequestWithContext(ctx, "GET", "https://httpbin.org/get", nil)
	
	resp, err := client.Do(req)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}
	defer resp.Body.Close()
	
	_, err = io.ReadAll(resp.Body)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	// Simulate processing time
	time.Sleep(200 * time.Millisecond)

	return nil
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Handle database operations
	if err := databaseCall(ctx); err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}
	
	// Call external API
	if err := externalAPICall(ctx); err != nil {
		http.Error(w, fmt.Sprintf("External API error: %v", err), http.StatusInternalServerError)
		return
	}
	
	// Success response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Request processed successfully at %s\n", time.Now().Format(time.RFC3339))
}

func main() {
	log.Println("Starting OpenTelemetry example service...")

	// Initialize OpenTelemetry
	shutdown, err := initProvider()
	if err != nil {
		log.Fatalf("Failed to initialize OpenTelemetry: %v", err)
	}
	
	// Wrap the handler with OpenTelemetry instrumentation
	handler := http.HandlerFunc(handleRequest)
	wrappedHandler := otelhttp.NewHandler(handler, "http.server.request")
	
	// Set up an HTTP server
	http.Handle("/", wrappedHandler)
	
	// Custom health check without tracing
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Start HTTP server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	server := &http.Server{
		Addr: ":" + port,
	}
	
	// Handle graceful shutdown
	go func() {
		log.Printf("Server listening on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()
	
	// Wait for termination signal
	<-make(chan struct{})
	
	// Shutdown OpenTelemetry
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := shutdown(ctx); err != nil {
		log.Fatalf("Failed to shutdown OpenTelemetry provider: %v", err)
	}
}