from locust import HttpUser, task, between
import json
import random
import os

# Load scenarios - chemin relatif
scenario_file = os.path.join(os.path.dirname(__file__), '100_scenarios.json')
with open(scenario_file) as f:
    SCENARIOS = json.load(f)

class PriceyLoad100(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        self.token = None
        self.scenario = random.choice(SCENARIOS)
        self.register_and_login()
    
    def register_and_login(self):
        username = f"user_{self.scenario['id']}_{random.randint(1000, 9999)}"
        password = "TestPass123!"
        
        response = self.client.post("/api/auth/register", json={
            "username": username,
            "password": password
        })
        
        if response.status_code == 200:
            self.token = response.json()["access_token"]
    
    @task(10)
    def calculate_scenario(self):
        """Main task: calculate the scenario"""
        if not self.token:
            self.on_start()
            return
        
        payload = {
            "provider": self.scenario["provider"],
            "session_id": f"sess_{self.scenario['id']}",
            "services": self.scenario["services"],
            "data_transfers": []
        }
        
        self.client.post(
            "/api/estimations/calculate",
            json=payload,
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(3)
    def save_scenario(self):
        """Save the estimation"""
        if not self.token:
            self.on_start()
            return
        
        payload = {
            "name": self.scenario["name"],
            "provider": self.scenario["provider"],
            "data": {
                "total_monthly_cost": self.scenario["expected_monthly"],
                "total_annual_cost": self.scenario["expected_monthly"] * 12
            },
            "services": [
                {
                    "service_name": svc["service"],
                    "region": svc["region"],
                    "quantity": svc["quantity"],
                    "monthly_cost": 100,
                    "annual_cost": 1200,
                    "parameters": {"resource_type": svc["resource_type"]}
                }
                for svc in self.scenario["services"]
            ]
        }
        
        self.client.post(
            "/api/estimations/save",
            json=payload,
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(1)
    def list_estimations(self):
        """List user estimations"""
        if not self.token:
            self.on_start()
            return
        
        self.client.get(
            "/api/estimations?limit=10&offset=0",
            headers={"Authorization": f"Bearer {self.token}"}
        )

