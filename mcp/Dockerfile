FROM golang:1.25-alpine AS build
WORKDIR /src
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/rapidreach-mcp ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/rapidreach-mcp /rapidreach-mcp
EXPOSE 8080
ENTRYPOINT ["/rapidreach-mcp", "-http", ":8080"]
