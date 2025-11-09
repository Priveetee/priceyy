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

func (r *PriceRepository) FindPrices(ctx context.Context, provider, resourceType, region, priceModel, unitOfMeasure string) ([]*ent.Price, error) {
	p, err := r.client.Price.Query().
		Where(
			price.Provider(provider),
			price.ResourceType(resourceType),
			price.Region(region),
			price.PriceModel(priceModel),
			price.UnitOfMeasure(unitOfMeasure),
		).
		First(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return []*ent.Price{}, nil
		}
		return nil, err
	}
	return []*ent.Price{p}, nil
}

func (r *PriceRepository) FindResourceOptions(ctx context.Context, provider, resourceType, region string) ([]*ent.Price, error) {
	return r.client.Price.Query().
		Where(
			price.Provider(provider),
			price.ResourceType(resourceType),
			price.Region(region),
		).
		All(ctx)
}

func (r *PriceRepository) ListDistinctProviders(ctx context.Context) ([]string, error) {
	return r.client.Price.Query().
		Order(ent.Asc(price.FieldProvider)).
		GroupBy(price.FieldProvider).
		Strings(ctx)
}

func (r *PriceRepository) ListDistinctRegions(ctx context.Context, provider string) ([]string, error) {
	return r.client.Price.Query().
		Where(price.Provider(provider)).
		Order(ent.Asc(price.FieldRegion)).
		GroupBy(price.FieldRegion).
		Strings(ctx)
}

func (r *PriceRepository) ListDistinctResourceTypes(ctx context.Context, provider, region, query string) ([]string, error) {
	q := r.client.Price.Query().
		Where(
			price.Provider(provider),
			price.Region(region),
		)

	if query != "" {
		q = q.Where(price.ResourceTypeContainsFold(query))
	}

	return q.Order(ent.Asc(price.FieldResourceType)).
		Limit(100).
		GroupBy(price.FieldResourceType).
		Strings(ctx)
}
