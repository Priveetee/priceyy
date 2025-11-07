package service

import (
	"context"
	"fmt"
	"priceyy/api/ent"
)

type PriceRepository interface {
	FindPrice(ctx context.Context, provider, resourceType, region, priceModel string) (*ent.Price, error)
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
	Provider     string
	ResourceType string
	Region       string
	Quantity     int
}

type ServiceCost struct {
	ResourceType  string
	Region        string
	Quantity      int
	UnitOfMeasure string
	CostPerMonth  float64
}

type CalculationResult struct {
	TotalCostPerMonth float64
	Breakdown         []ServiceCost
}

func (s *PriceService) Calculate(ctx context.Context, items []CalculationItem) (*CalculationResult, error) {
	var totalCost float64
	var breakdown []ServiceCost
	hoursPerMonth := 730.0

	for _, item := range items {
		priceRecord, err := s.repo.FindPrice(ctx, item.Provider, item.ResourceType, item.Region, "on-demand")
		if err != nil {
			return nil, fmt.Errorf("price not found for %s in %s", item.ResourceType, item.Region)
		}

		var cost float64
		switch priceRecord.UnitOfMeasure {
		case "Hrs", "1 Hour":
			cost = float64(item.Quantity) * priceRecord.PricePerUnit * hoursPerMonth
		default:
			cost = float64(item.Quantity) * priceRecord.PricePerUnit
		}

		totalCost += cost

		breakdown = append(breakdown, ServiceCost{
			ResourceType:  item.ResourceType,
			Region:        item.Region,
			Quantity:      item.Quantity,
			UnitOfMeasure: priceRecord.UnitOfMeasure,
			CostPerMonth:  cost,
		})
	}

	return &CalculationResult{
		TotalCostPerMonth: totalCost,
		Breakdown:         breakdown,
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
