FROM golang:1.24 AS builder

WORKDIR /app

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /main .

FROM alpine:latest

WORKDIR /

COPY --from=builder /main /main

EXPOSE 8080

CMD ["/main"]
