from locust import HttpUser, task, between
import random

class PriceyUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        self.token = None
        self.estimation_id = None
        self.register_and_login()
    
    def register_and_login(self):
        username = f"user_{random.randint(1000, 9999)}"
        password = "TestPass123!"
        
        response = self.client.post("/api/auth/register", json={
            "username": username,
            "password": password
        })
        
        if response.status_code == 200:
            self.token = response.json()["access_token"]
    
    @task(3)
    def calculate_estimation(self):
        if not self.token:
            self.register_and_login()
            return
        
        payload = {
            "provider": "aws",
            "session_id": f"sess_{random.randint(1000, 9999)}",
            "services": [
                {
                    "service": "EC2",
                    "resource_type": "t3.large",
                    "quantity": random.randint(1, 5),
                    "region": "eu-west-1",
                    "pricing_model": "on-demand",
                    "hours_per_month": 730
                }
            ],
            "data_transfers": []
        }
        
        self.client.post(
            "/api/estimations/calculate",
            json=payload,
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(2)
    def list_estimations(self):
        if not self.token:
            self.register_and_login()
            return
        
        self.client.get(
            "/api/estimations?limit=10&offset=0",
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(1)
    def health_check(self):
        self.client.get("/health")
