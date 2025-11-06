package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"priceyy/api/ent"
	"priceyy/api/ent/price"

	_ "github.com/lib/pq"
)

// ... les structs ne changent pas ...
type CalculationRequestItem struct {
	Provider     string `json:"provider"`
	ResourceType string `json:"resourceType"`
	Region       string `json:"region"`
	Quantity     int    `json:"quantity"`
}

type CalculationRequest struct {
	Services []CalculationRequestItem `json:"services"`
}

type ServiceCost struct {
	ResourceType string  `json:"resourceType"`
	Region       string  `json:"region"`
	Quantity     int     `json:"quantity"`
	CostPerMonth float64 `json:"costPerMonth"`
}

type CalculationResponse struct {
	TotalCostPerMonth float64       `json:"totalCostPerMonth"`
	Breakdown         []ServiceCost `json:"breakdown"`
}

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set.")
	}

	connectionString := dbURL + "?sslmode=disable"

	client, err := ent.Open("postgres", connectionString, ent.Debug())
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	http.HandleFunc("/calculate", handleCalculate(client))
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "OK")
	})

	log.Println("Starting server on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

func handleCalculate(client *ent.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var req CalculationRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		var totalCost float64
		var breakdown []ServiceCost
		hoursPerMonth := 730.0

		for _, item := range req.Services {
			priceRecord, err := client.Price.Query().
				Where(
					price.Provider(item.Provider),
					price.ResourceType(item.ResourceType),
					price.Region(item.Region),
					price.PriceModel("on-demand"),
				).
				Only(context.Background())

			if err != nil {
				log.Printf("Could not find price for %s in %s: %v", item.ResourceType, item.Region, err)
				http.Error(w, fmt.Sprintf("Price not found for %s in %s", item.ResourceType, item.Region), http.StatusNotFound)
				return
			}

			cost := float64(item.Quantity) * priceRecord.PricePerHour * hoursPerMonth
			totalCost += cost

			breakdown = append(breakdown, ServiceCost{
				ResourceType: item.ResourceType,
				Region:       item.Region,
				Quantity:     item.Quantity,
				CostPerMonth: cost,
			})
		}

		resp := CalculationResponse{
			TotalCostPerMonth: totalCost,
			Breakdown:         breakdown,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}
