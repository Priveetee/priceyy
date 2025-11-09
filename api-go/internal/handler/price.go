package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"priceyy/api/internal/service"
)

type PriceService interface {
	GetResourceOptions(ctx context.Context, provider, resourceType, region string) ([]service.ResourceOption, error)
	Calculate(ctx context.Context, items []service.CalculationItem) (*service.CalculationResult, error)
	GetProviders(ctx context.Context) ([]string, error)
	GetRegions(ctx context.Context, provider string) ([]string, error)
	GetResourceTypes(ctx context.Context, provider, region, query string) ([]string, error)
}

type PriceHandler struct {
	service PriceService
}

type CalculationRequestItem struct {
	Provider      string  `json:"provider"`
	ResourceType  string  `json:"resourceType"`
	Region        string  `json:"region"`
	PriceModel    string  `json:"priceModel"`
	UnitOfMeasure string  `json:"unitOfMeasure"`
	Quantity      float64 `json:"quantity"`
}

type CalculationRequest struct {
	Services []CalculationRequestItem `json:"services"`
}

func NewPriceHandler(s PriceService) *PriceHandler {
	return &PriceHandler{service: s}
}

func (h *PriceHandler) HandleGetResourceOptions(w http.ResponseWriter, r *http.Request) {
	provider := r.URL.Query().Get("provider")
	resourceType := r.URL.Query().Get("resourceType")
	region := r.URL.Query().Get("region")

	if provider == "" || resourceType == "" || region == "" {
		http.Error(w, "Missing required query parameters: provider, resourceType, region", http.StatusBadRequest)
		return
	}

	options, err := h.service.GetResourceOptions(r.Context(), provider, resourceType, region)
	if err != nil {
		http.Error(w, "Failed to retrieve resource options", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(options)
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
			Provider:      s.Provider,
			ResourceType:  s.ResourceType,
			Region:        s.Region,
			PriceModel:    s.PriceModel,
			UnitOfMeasure: s.UnitOfMeasure,
			Quantity:      s.Quantity,
		}
	}

	result, err := h.service.Calculate(r.Context(), items)
	if err != nil {
		log.Printf("Calculation failed: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *PriceHandler) HandleGetProviders(w http.ResponseWriter, r *http.Request) {
	providers, err := h.service.GetProviders(r.Context())
	if err != nil {
		http.Error(w, "Failed to get providers", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(providers)
}

func (h *PriceHandler) HandleGetRegions(w http.ResponseWriter, r *http.Request) {
	provider := r.URL.Query().Get("provider")
	if provider == "" {
		http.Error(w, "Query parameter 'provider' is required", http.StatusBadRequest)
		return
	}
	regions, err := h.service.GetRegions(r.Context(), provider)
	if err != nil {
		http.Error(w, "Failed to get regions", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(regions)
}

func (h *PriceHandler) HandleGetResourceTypes(w http.ResponseWriter, r *http.Request) {
	provider := r.URL.Query().Get("provider")
	region := r.URL.Query().Get("region")
	query := r.URL.Query().Get("q")
	if provider == "" || region == "" {
		http.Error(w, "Query parameters 'provider' and 'region' are required", http.StatusBadRequest)
		return
	}
	resources, err := h.service.GetResourceTypes(r.Context(), provider, region, query)
	if err != nil {
		http.Error(w, "Failed to get resource types", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resources)
}
