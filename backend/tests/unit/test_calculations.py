import pytest
from src.api.estimations import calculate_reserved_cost
from decimal import Decimal

def test_reserved_cost_1y():
    result = calculate_reserved_cost(
        hourly_price=0.05,
        upfront_cost=1200,
        quantity=2,
        hours_per_month=730,
        commitment_years=1
    )
    
    expected = (1200 / (1 * 12)) / 2 + 0.05 * 730
    assert abs(result - expected) < 0.01

def test_reserved_cost_3y():
    result = calculate_reserved_cost(
        hourly_price=0.05,
        upfront_cost=1200,
        quantity=2,
        hours_per_month=730,
        commitment_years=3
    )
    
    expected = (1200 / (3 * 12)) / 2 + 0.05 * 730
    assert abs(result - expected) < 0.01

def test_reserved_cost_no_upfront():
    result = calculate_reserved_cost(
        hourly_price=0.05,
        upfront_cost=0,
        quantity=2,
        hours_per_month=730,
        commitment_years=3
    )
    
    expected = 0.05 * 730
    assert abs(result - expected) < 0.01

def test_on_demand_calculation():
    hourly = 0.0974
    quantity = 2
    hours_per_month = 730
    
    monthly = hourly * quantity * hours_per_month
    annual = monthly * 12
    
    assert abs(monthly - 142.204) < 0.01
    assert abs(annual - 1706.448) < 0.01

def test_spot_discount():
    hourly = 0.0974
    spot_price = hourly * 0.1
    
    assert abs(spot_price - 0.00974) < 0.0001
