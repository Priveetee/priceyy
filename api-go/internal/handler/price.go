package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"priceyy/api/internal/service"
)

type PriceService interface {
	Calculate(ctx context.Context, items []service.CalculationItem) (*service.CalculationResult, error)
	GetRegions(ctx context.Context, provider string) ([]string, error)
}

type PriceHandler struct {
	service PriceService
}

func NewPriceHandler(s PriceService) *PriceHandler {
	return &PriceHandler{service: s}
}

type CalculationRequestItem struct {
	Provider     string `json:"provider"`
	ResourceType string `json:"resourceType"`
	Region       string `json:"region"`
	Quantity     int    `json:"quantity"`
}

type CalculationRequest struct {
	Services []CalculationRequestItem `json:"services"`
}

func (h *PriceHandler) HandleCalculate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req CalculationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	items := make([]service.CalculationItem, len(req.Services))
	for i, s := range req.Services {
		items[i] = service.CalculationItem{
			Provider:     s.Provider,
			ResourceType: s.ResourceType,
			Region:       s.Region,
			Quantity:     s.Quantity,
		}
	}

	result, err := h.service.Calculate(r.Context(), items)
	if err != nil {
		log.Printf("Calculation failed: %v", err)
		http.Error(w, fmt.Sprintf("Calculation error: %v", err), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *PriceHandler) HandleGetRegions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	provider := r.URL.Query().Get("provider")
	if provider == "" {
		http.Error(w, "Query parameter 'provider' is required", http.StatusBadRequest)
		return
	}

	regions, err := h.service.GetRegions(r.Context(), provider)
	if err != nil {
		log.Printf("Failed to get regions: %v", err)
		http.Error(w, "Failed to get regions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(regions)
}
