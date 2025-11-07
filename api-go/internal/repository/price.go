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
		First(ctx)
}

func (r *PriceRepository) ListDistinctProviders(ctx context.Context) ([]string, error) {
	return r.client.Price.Query().
		GroupBy(price.FieldProvider).
		Strings(ctx)
}

func (r *PriceRepository) ListDistinctRegions(ctx context.Context, provider string) ([]string, error) {
	return r.client.Price.Query().
		Where(price.Provider(provider)).
		GroupBy(price.FieldRegion).
		Strings(ctx)
}

func (r *PriceRepository) ListDistinctResourceTypes(ctx context.Context, provider, region string) ([]string, error) {
	return r.client.Price.Query().
		Where(
			price.Provider(provider),
			price.Region(region),
		).
		Order(ent.Asc(price.FieldResourceType)).
		GroupBy(price.FieldResourceType).
		Strings(ctx)
}
