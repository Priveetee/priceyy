FROM golang:1.25 AS builder

WORKDIR /app

COPY . .

RUN go mod tidy

RUN CGO_ENABLED=0 GOOS=linux go build -o /main ./cmd/api

FROM alpine:latest

WORKDIR /

COPY --from=builder /main /main

EXPOSE 8080

CMD ["/main"]
