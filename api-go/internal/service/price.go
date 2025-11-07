package service

import (
	"context"
	"fmt"
	"priceyy/api/ent"
)

type PriceRepository interface {
	FindPrices(ctx context.Context, provider, resourceType, region, priceModel string) ([]*ent.Price, error)
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
	Usage        map[string]float64
}

type UsageCost struct {
	Unit         string  `json:"unit"`
	Quantity     float64 `json:"quantity"`
	CostPerMonth float64 `json:"costPerMonth"`
}

type ServiceCost struct {
	ResourceType   string      `json:"resourceType"`
	Region         string      `json:"region"`
	TotalCost      float64     `json:"totalCost"`
	UsageBreakdown []UsageCost `json:"usageBreakdown"`
}

type CalculationResult struct {
	TotalCostPerMonth float64       `json:"totalCostPerMonth"`
	Breakdown         []ServiceCost `json:"breakdown"`
}

func (s *PriceService) Calculate(ctx context.Context, items []CalculationItem) (*CalculationResult, error) {
	var totalCost float64
	var breakdown []ServiceCost
	hoursPerMonth := 730.0

	for _, item := range items {
		priceRecords, err := s.repo.FindPrices(ctx, item.Provider, item.ResourceType, item.Region, "on-demand")
		if err != nil || len(priceRecords) == 0 {
			return nil, fmt.Errorf("prices not found for %s in %s", item.ResourceType, item.Region)
		}

		priceMap := make(map[string]float64)
		for _, p := range priceRecords {
			priceMap[p.UnitOfMeasure] = p.PricePerUnit
		}

		var serviceTotalCost float64
		var usageBreakdown []UsageCost

		for unit, quantity := range item.Usage {
			pricePerUnit, ok := priceMap[unit]
			if !ok {
				continue
			}

			var cost float64
			switch unit {
			case "Hrs", "1 Hour":
				cost = quantity * pricePerUnit * hoursPerMonth
			default:
				cost = quantity * pricePerUnit
			}

			serviceTotalCost += cost
			usageBreakdown = append(usageBreakdown, UsageCost{
				Unit:         unit,
				Quantity:     quantity,
				CostPerMonth: cost,
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
