#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Worksite Management App
Tests all worker management endpoints without authentication
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://worksite-manager-8.preview.emergentagent.com/api"

class WorksiteAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_workers = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })
        
    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                self.log_test("API Root", True, f"API is active: {data.get('message', 'No message')}")
                return True
            else:
                self.log_test("API Root", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Root", False, f"Connection error: {str(e)}")
            return False
    
    def test_cors_headers(self, response):
        """Check if CORS headers are present"""
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers'
        ]
        
        missing_headers = []
        for header in cors_headers:
            if header not in response.headers:
                missing_headers.append(header)
        
        if missing_headers:
            self.log_test("CORS Headers", False, f"Missing headers: {missing_headers}")
            return False
        else:
            self.log_test("CORS Headers", True, "All CORS headers present")
            return True
    
    def test_create_worker(self):
        """Test creating a new worker"""
        worker_data = {
            "name": "John Mason",
            "phone": "9876543210",
            "role": "Mason",
            "daily_rate": 600,
            "site_id": "Zonuam Site"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/workers",
                json=worker_data,
                headers={"Content-Type": "application/json"}
            )
            
            # Check CORS headers
            self.test_cors_headers(response)
            
            if response.status_code in [200, 201]:
                data = response.json()
                if "id" in data and data["name"] == worker_data["name"]:
                    self.created_workers.append(data["id"])
                    self.log_test("Create Worker", True, f"Worker created with ID: {data['id']}", data)
                    return data["id"]
                else:
                    self.log_test("Create Worker", False, f"Invalid response structure: {data}")
                    return None
            else:
                self.log_test("Create Worker", False, f"Status code: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Create Worker", False, f"Request error: {str(e)}")
            return None
    
    def test_get_workers(self):
        """Test getting all workers"""
        try:
            response = self.session.get(f"{self.base_url}/workers")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Workers", True, f"Retrieved {len(data)} workers", data)
                    return data
                else:
                    self.log_test("Get Workers", False, f"Expected list, got: {type(data)}")
                    return None
            else:
                self.log_test("Get Workers", False, f"Status code: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Get Workers", False, f"Request error: {str(e)}")
            return None
    
    def test_get_worker_by_id(self, worker_id):
        """Test getting a specific worker by ID"""
        if not worker_id:
            self.log_test("Get Worker by ID", False, "No worker ID provided")
            return None
            
        try:
            response = self.session.get(f"{self.base_url}/workers/{worker_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == worker_id:
                    self.log_test("Get Worker by ID", True, f"Retrieved worker: {data['name']}", data)
                    return data
                else:
                    self.log_test("Get Worker by ID", False, f"ID mismatch: expected {worker_id}, got {data.get('id')}")
                    return None
            elif response.status_code == 404:
                self.log_test("Get Worker by ID", False, "Worker not found (404)")
                return None
            else:
                self.log_test("Get Worker by ID", False, f"Status code: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Get Worker by ID", False, f"Request error: {str(e)}")
            return None
    
    def test_update_worker(self, worker_id):
        """Test updating a worker"""
        if not worker_id:
            self.log_test("Update Worker", False, "No worker ID provided")
            return None
            
        update_data = {
            "name": "John Updated Mason",
            "phone": "1234567890",
            "role": "Senior Mason",
            "daily_rate": 700
        }
        
        try:
            response = self.session.put(
                f"{self.base_url}/workers/{worker_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("name") == update_data["name"]:
                    self.log_test("Update Worker", True, f"Worker updated successfully", data)
                    return data
                else:
                    self.log_test("Update Worker", False, f"Update failed: {data}")
                    return None
            elif response.status_code == 404:
                self.log_test("Update Worker", False, "Worker not found (404)")
                return None
            else:
                self.log_test("Update Worker", False, f"Status code: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Update Worker", False, f"Request error: {str(e)}")
            return None
    
    def test_delete_worker(self, worker_id):
        """Test deleting a worker"""
        if not worker_id:
            self.log_test("Delete Worker", False, "No worker ID provided")
            return False
            
        try:
            response = self.session.delete(f"{self.base_url}/workers/{worker_id}")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "deleted" in data["message"].lower():
                    self.log_test("Delete Worker", True, f"Worker deleted successfully: {data['message']}")
                    return True
                else:
                    self.log_test("Delete Worker", False, f"Unexpected response: {data}")
                    return False
            elif response.status_code == 404:
                self.log_test("Delete Worker", False, "Worker not found (404)")
                return False
            else:
                self.log_test("Delete Worker", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Delete Worker", False, f"Request error: {str(e)}")
            return False
    
    def test_data_persistence(self):
        """Test that data persists in MongoDB"""
        # Create a worker
        worker_id = self.test_create_worker()
        if not worker_id:
            return False
        
        # Verify it exists by fetching it
        worker_data = self.test_get_worker_by_id(worker_id)
        if not worker_data:
            return False
        
        # Verify it appears in the list
        all_workers = self.test_get_workers()
        if all_workers:
            worker_ids = [w.get("id") for w in all_workers]
            if worker_id in worker_ids:
                self.log_test("Data Persistence", True, "Worker persisted correctly in database")
                return True
            else:
                self.log_test("Data Persistence", False, "Worker not found in workers list")
                return False
        else:
            self.log_test("Data Persistence", False, "Could not retrieve workers list")
            return False
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        # Test invalid worker ID
        response = self.session.get(f"{self.base_url}/workers/invalid-id")
        if response.status_code == 404:
            self.log_test("Error Handling - Invalid ID", True, "Correctly returned 404 for invalid worker ID")
        else:
            self.log_test("Error Handling - Invalid ID", False, f"Expected 404, got {response.status_code}")
        
        # Test invalid JSON for create
        try:
            response = self.session.post(
                f"{self.base_url}/workers",
                json={},  # Empty data
                headers={"Content-Type": "application/json"}
            )
            # Should handle gracefully (either 400 or create with defaults)
            if response.status_code in [200, 201, 400, 422]:
                self.log_test("Error Handling - Empty Data", True, f"Handled empty data gracefully (status: {response.status_code})")
            else:
                self.log_test("Error Handling - Empty Data", False, f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Empty Data", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting Worksite Management API Tests")
        print(f"📍 Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test API connectivity
        if not self.test_api_root():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Test data persistence
        self.test_data_persistence()
        
        # Test CRUD operations
        worker_id = self.test_create_worker()
        if worker_id:
            self.test_get_worker_by_id(worker_id)
            self.test_update_worker(worker_id)
            # Don't delete yet, test list first
            
        # Test listing workers
        self.test_get_workers()
        
        # Test error handling
        self.test_error_handling()
        
        # Clean up - delete created workers
        for worker_id in self.created_workers:
            self.test_delete_worker(worker_id)
        
        # Print summary
        self.print_summary()
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['message']}")
        
        print("\n" + "=" * 60)

def main():
    """Main test execution"""
    tester = WorksiteAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()