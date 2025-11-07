package service

import (
	"context"
	"priceyy/api/ent"
)

type PriceRepository interface {
	FindPrice(ctx context.Context, provider, resourceType, region, priceModel string) (*ent.Price, error)
	ListDistinctRegions(ctx context.Context, provider string) ([]string, error)
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
	ResourceType string
	Region       string
	Quantity     int
	CostPerMonth float64
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
			return nil, err
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

	return &CalculationResult{
		TotalCostPerMonth: totalCost,
		Breakdown:         breakdown,
	}, nil
}

func (s *PriceService) GetRegions(ctx context.Context, provider string) ([]string, error) {
	return s.repo.ListDistinctRegions(ctx, provider)
}
