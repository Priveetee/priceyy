package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/google/uuid"
)

type Price struct {
	ent.Schema
}

func (Price) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New).Unique(),
		field.String("provider"),
		field.String("service"),
		field.String("resource_type"),
		field.String("region"),
		field.String("price_model"),
		field.Float("price_per_unit"),
		field.String("unit_of_measure"),
		field.Float("upfront_cost").Optional(),
		field.String("currency").Default("USD"),
		field.Time("last_updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

func (Price) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("provider", "resource_type", "region", "price_model", "unit_of_measure").Unique(),
	}
}
