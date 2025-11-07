package repository

import (
	"context"
	"priceyy/api/ent"
	"priceyy/api/ent/price"
)

type PriceRepository struct {
	client *ent.Client
}

func NewPriceRepository(client *ent.Client) *PriceRepository {
	return &PriceRepository{client: client}
}

func (r *PriceRepository) FindPrice(ctx context.Context, provider, resourceType, region, priceModel string) (*ent.Price, error) {
	return r.client.Price.Query().
		Where(
			price.Provider(provider),
			price.ResourceType(resourceType),
			price.Region(region),
			price.PriceModel(priceModel),
		).
		Only(ctx)
}

func (r *PriceRepository) ListDistinctRegions(ctx context.Context, provider string) ([]string, error) {
	return r.client.Price.Query().
		Where(price.Provider(provider)).
		GroupBy(price.FieldRegion).
		Strings(ctx)
}
