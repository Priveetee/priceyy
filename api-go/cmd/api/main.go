package main

import (
	"log"
	"net/http"
	"os"
	"priceyy/api/ent"
	"priceyy/api/internal/handler"
	"priceyy/api/internal/repository"
	"priceyy/api/internal/service"

	_ "github.com/lib/pq"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set.")
	}
	connectionString := dbURL + "?sslmode=disable"

	client, err := ent.Open("postgres", connectionString)
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	priceRepo := repository.NewPriceRepository(client)
	priceService := service.NewPriceService(priceRepo)
	priceHandler := handler.NewPriceHandler(priceService)

	http.HandleFunc("/calculate", priceHandler.HandleCalculate)
	http.HandleFunc("/regions", priceHandler.HandleGetRegions)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	log.Println("Starting server on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
