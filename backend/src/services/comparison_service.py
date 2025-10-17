from typing import Dict, List, Any
from src.models.estimation import Estimation

class ComparisonService:
    
    @staticmethod
    def compare_estimations(est1: Estimation, est2: Estimation) -> Dict[str, Any]:
        data1 = est1.data or {}
        data2 = est2.data or {}
        
        cost_diff_monthly = data2.get('total_monthly_cost', 0) - data1.get('total_monthly_cost', 0)
        cost_diff_annual = data2.get('total_annual_cost', 0) - data1.get('total_annual_cost', 0)
        
        est1_monthly = data1.get('total_monthly_cost', 1)
        cost_diff_percentage = (cost_diff_monthly / est1_monthly * 100) if est1_monthly > 0 else 0
        
        services1 = {s.get('service', ''): s for s in data1.get('services_breakdown', [])} if 'services_breakdown' in data1 else {}
        services2 = {s.get('service', ''): s for s in data2.get('services_breakdown', [])} if 'services_breakdown' in data2 else {}
        
        services_added = [s for s in services2.keys() if s not in services1]
        services_removed = [s for s in services1.keys() if s not in services2]
        services_changed = []
        
        for service in services1.keys():
            if service in services2:
                if services1[service].get('monthly_cost') != services2[service].get('monthly_cost'):
                    services_changed.append({
                        "service": service,
                        "cost_before": services1[service].get('monthly_cost'),
                        "cost_after": services2[service].get('monthly_cost'),
                        "difference": services2[service].get('monthly_cost', 0) - services1[service].get('monthly_cost', 0)
                    })
        
        direction = "increased" if cost_diff_monthly > 0 else "decreased" if cost_diff_monthly < 0 else "unchanged"
        
        return {
            "cost_comparison": {
                "monthly": {
                    "before": data1.get('total_monthly_cost'),
                    "after": data2.get('total_monthly_cost'),
                    "difference": round(cost_diff_monthly, 2),
                    "percentage_change": round(cost_diff_percentage, 2)
                },
                "annual": {
                    "before": data1.get('total_annual_cost'),
                    "after": data2.get('total_annual_cost'),
                    "difference": round(cost_diff_annual, 2),
                    "percentage_change": round(cost_diff_percentage, 2)
                },
                "direction": direction
            },
            "services_analysis": {
                "added": services_added,
                "removed": services_removed,
                "modified": services_changed
            },
            "summary": f"Cost {direction} by €{abs(cost_diff_monthly):.2f}/month ({cost_diff_percentage:.1f}%)"
        }
