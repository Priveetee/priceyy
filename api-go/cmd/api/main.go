package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"priceyy/api/ent"
	"priceyy/api/internal/handler"
	"priceyy/api/internal/repository"
	"priceyy/api/internal/service"
	"time"

	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set.")
	}
	connectionString := dbURL + "?sslmode=disable"

	var client *ent.Client
	var err error
	for i := 0; i < 5; i++ {
		client, err = ent.Open("postgres", connectionString)
		if err == nil {
			break
		}
		log.Printf("failed to connect to postgres (attempt %d): %v", i+1, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	priceRepo := repository.NewPriceRepository(client)
	priceService := service.NewPriceService(priceRepo)
	priceHandler := handler.NewPriceHandler(priceService)

	mux := http.NewServeMux()
	mux.HandleFunc("/calculate", priceHandler.HandleCalculate)
	mux.HandleFunc("/providers", priceHandler.HandleGetProviders)
	mux.HandleFunc("/regions", priceHandler.HandleGetRegions)
	mux.HandleFunc("/resources", priceHandler.HandleGetResourceTypes)
	mux.HandleFunc("/resource-options", priceHandler.HandleGetResourceOptions)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(mux)

	log.Println("Starting server on port 8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal(err)
	}
}
