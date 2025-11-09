package service

import (
	"context"
	"fmt"
	"priceyy/api/ent"
)

type PriceRepository interface {
	FindPrices(ctx context.Context, provider, resourceType, region, priceModel, unitOfMeasure string) ([]*ent.Price, error)
	FindResourceOptions(ctx context.Context, provider, resourceType, region string) ([]*ent.Price, error)
	ListDistinctProviders(ctx context.Context) ([]string, error)
	ListDistinctRegions(ctx context.Context, provider string) ([]string, error)
	ListDistinctResourceTypes(ctx context.Context, provider, region, query string) ([]string, error)
}

type PriceService struct {
	repo PriceRepository
}

func NewPriceService(repo PriceRepository) *PriceService {
	return &PriceService{repo: repo}
}

type CalculationItem struct {
	Provider      string
	ResourceType  string
	Region        string
	PriceModel    string
	UnitOfMeasure string
	Quantity      float64
}

type UsageCost struct {
	Unit     string  `json:"unit"`
	Quantity float64 `json:"quantity"`
	Cost     float64 `json:"cost"`
}

type ServiceCost struct {
	ResourceType   string      `json:"resourceType"`
	Region         string      `json:"region"`
	TotalCost      float64     `json:"totalCost"`
	UsageBreakdown []UsageCost `json:"usageBreakdown"`
}

type CalculationResult struct {
	TotalCost float64       `json:"totalCost"`
	Breakdown []ServiceCost `json:"breakdown"`
}

type ResourceOption struct {
	PriceModel    string  `json:"priceModel"`
	UnitOfMeasure string  `json:"unitOfMeasure"`
	PricePerUnit  float64 `json:"pricePerUnit"`
}

func (s *PriceService) GetResourceOptions(ctx context.Context, provider, resourceType, region string) ([]ResourceOption, error) {
	records, err := s.repo.FindResourceOptions(ctx, provider, resourceType, region)
	if err != nil {
		return nil, err
	}

	if len(records) == 0 {
		return []ResourceOption{}, nil
	}

	optionsMap := make(map[string]ResourceOption)
	for _, r := range records {
		key := fmt.Sprintf("%s-%s", r.PriceModel, r.UnitOfMeasure)
		if _, exists := optionsMap[key]; !exists {
			optionsMap[key] = ResourceOption{
				PriceModel:    r.PriceModel,
				UnitOfMeasure: r.UnitOfMeasure,
				PricePerUnit:  r.PricePerUnit,
			}
		}
	}

	options := make([]ResourceOption, 0, len(optionsMap))
	for _, option := range optionsMap {
		options = append(options, option)
	}

	return options, nil
}

func (s *PriceService) Calculate(ctx context.Context, items []CalculationItem) (*CalculationResult, error) {
	var totalCost float64
	var breakdown []ServiceCost

	for _, item := range items {
		priceRecords, err := s.repo.FindPrices(ctx, item.Provider, item.ResourceType, item.Region, item.PriceModel, item.UnitOfMeasure)
		if err != nil {
			return nil, err
		}

		serviceTotalCost := 0.0
		var usageBreakdown []UsageCost

		if len(priceRecords) > 0 {
			priceRecord := priceRecords[0]
			cost := item.Quantity * priceRecord.PricePerUnit
			serviceTotalCost += cost
			usageBreakdown = append(usageBreakdown, UsageCost{
				Unit:     item.UnitOfMeasure,
				Quantity: item.Quantity,
				Cost:     cost,
			})
		}

		totalCost += serviceTotalCost
		breakdown = append(breakdown, ServiceCost{
			ResourceType:   item.ResourceType,
			Region:         item.Region,
			TotalCost:      serviceTotalCost,
			UsageBreakdown: usageBreakdown,
		})
	}

	return &CalculationResult{
		TotalCost: totalCost,
		Breakdown: breakdown,
	}, nil
}

func (s *PriceService) GetProviders(ctx context.Context) ([]string, error) {
	return s.repo.ListDistinctProviders(ctx)
}

func (s *PriceService) GetRegions(ctx context.Context, provider string) ([]string, error) {
	return s.repo.ListDistinctRegions(ctx, provider)
}

func (s *PriceService) GetResourceTypes(ctx context.Context, provider, region, query string) ([]string, error) {
	return s.repo.ListDistinctResourceTypes(ctx, provider, region, query)
}
