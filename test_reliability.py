#!/usr/bin/env python3
"""
URL Reliability Tester
Tests the reliability and performance of a web service by making multiple HTTP requests.
"""

import requests
import time
from datetime import datetime
from collections import Counter
import statistics
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
URL = "https://gmail.jeffistores.in/"
NUM_REQUESTS = 100  # Total number of requests to make
CONCURRENT_REQUESTS = 10  # Number of concurrent requests
TIMEOUT = 10  # Request timeout in seconds
DELAY_BETWEEN_BATCHES = 0.1  # Delay between batches in seconds

# ANSI color codes for better output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'


class ReliabilityTester:
    def __init__(self, url, num_requests, concurrent_requests, timeout):
        self.url = url
        self.num_requests = num_requests
        self.concurrent_requests = concurrent_requests
        self.timeout = timeout
        self.results = []
        self.response_times = []
        self.status_codes = []
        self.errors = []

    def make_request(self, request_num):
        """Make a single HTTP request and return results."""
        start_time = time.time()
        result = {
            'request_num': request_num,
            'timestamp': datetime.now().isoformat(),
            'success': False,
            'status_code': None,
            'response_time': None,
            'error': None
        }

        try:
            response = requests.get(
                self.url,
                timeout=self.timeout,
                headers={'User-Agent': 'ReliabilityTester/1.0'}
            )
            response_time = time.time() - start_time

            result['success'] = response.status_code == 200
            result['status_code'] = response.status_code
            result['response_time'] = response_time

            self.response_times.append(response_time)
            self.status_codes.append(response.status_code)

        except requests.exceptions.Timeout:
            result['error'] = 'Timeout'
            self.errors.append('Timeout')
        except requests.exceptions.ConnectionError:
            result['error'] = 'Connection Error'
            self.errors.append('Connection Error')
        except requests.exceptions.RequestException as e:
            result['error'] = str(e)
            self.errors.append(str(e))

        return result

    def run_tests(self):
        """Run all reliability tests."""
        print(f"{BOLD}{BLUE}Starting Reliability Test{RESET}")
        print(f"URL: {self.url}")
        print(f"Total Requests: {self.num_requests}")
        print(f"Concurrent Requests: {self.concurrent_requests}")
        print(f"Timeout: {self.timeout}s")
        print("-" * 70)

        start_time = time.time()
        completed = 0

        # Use ThreadPoolExecutor for concurrent requests
        with ThreadPoolExecutor(max_workers=self.concurrent_requests) as executor:
            # Submit all requests
            futures = {
                executor.submit(self.make_request, i): i
                for i in range(1, self.num_requests + 1)
            }

            # Process completed requests
            for future in as_completed(futures):
                result = future.result()
                self.results.append(result)
                completed += 1

                # Print progress
                status_icon = f"{GREEN}OK{RESET}" if result['success'] else f"{RED}FAIL{RESET}"
                status_text = f"Status: {result['status_code']}" if result['status_code'] else f"Error: {result['error']}"
                response_time_text = f"{result['response_time']:.3f}s" if result['response_time'] else "N/A"

                print(f"[{completed}/{self.num_requests}] {status_icon} Request #{result['request_num']:03d} | "
                      f"{status_text} | Time: {response_time_text}")

                # Small delay between batches
                if completed % self.concurrent_requests == 0:
                    time.sleep(DELAY_BETWEEN_BATCHES)

        total_time = time.time() - start_time
        self.print_summary(total_time)

    def print_summary(self, total_time):
        """Print detailed test summary."""
        print("\n" + "=" * 70)
        print(f"{BOLD}{BLUE}Test Summary{RESET}")
        print("=" * 70)

        # Success/Failure metrics
        successful_requests = sum(1 for r in self.results if r['success'])
        failed_requests = len(self.results) - successful_requests
        success_rate = (successful_requests / len(self.results)) * 100

        print(f"\n{BOLD}Request Statistics:{RESET}")
        print(f"  Total Requests:      {len(self.results)}")
        print(f"  {GREEN}Successful:{RESET}          {successful_requests} ({success_rate:.2f}%)")
        print(f"  {RED}Failed:{RESET}              {failed_requests} ({100 - success_rate:.2f}%)")

        # Status code distribution
        if self.status_codes:
            print(f"\n{BOLD}Status Code Distribution:{RESET}")
            status_counter = Counter(self.status_codes)
            for status, count in sorted(status_counter.items()):
                percentage = (count / len(self.status_codes)) * 100
                color = GREEN if status == 200 else YELLOW if 300 <= status < 400 else RED
                print(f"  {color}{status}{RESET}: {count} ({percentage:.2f}%)")

        # Error distribution
        if self.errors:
            print(f"\n{BOLD}{RED}Error Distribution:{RESET}")
            error_counter = Counter(self.errors)
            for error, count in error_counter.items():
                percentage = (count / len(self.results)) * 100
                print(f"  {error}: {count} ({percentage:.2f}%)")

        # Response time statistics
        if self.response_times:
            print(f"\n{BOLD}Response Time Statistics:{RESET}")
            print(f"  Minimum:             {min(self.response_times):.3f}s")
            print(f"  Maximum:             {max(self.response_times):.3f}s")
            print(f"  Average:             {statistics.mean(self.response_times):.3f}s")
            print(f"  Median:              {statistics.median(self.response_times):.3f}s")
            if len(self.response_times) > 1:
                print(f"  Std Deviation:       {statistics.stdev(self.response_times):.3f}s")

        # Overall metrics
        print(f"\n{BOLD}Overall Performance:{RESET}")
        print(f"  Total Test Duration: {total_time:.2f}s")
        print(f"  Requests per Second: {len(self.results) / total_time:.2f}")

        # Reliability verdict
        print(f"\n{BOLD}Reliability Verdict:{RESET}")
        if success_rate == 100:
            print(f"  {GREEN}EXCELLENT{RESET} - All requests succeeded!")
        elif success_rate >= 99:
            print(f"  {GREEN}VERY GOOD{RESET} - Nearly perfect reliability")
        elif success_rate >= 95:
            print(f"  {YELLOW}GOOD{RESET} - Acceptable reliability")
        elif success_rate >= 90:
            print(f"  {YELLOW}FAIR{RESET} - Some reliability issues")
        else:
            print(f"  {RED}POOR{RESET} - Significant reliability problems")

        print("=" * 70)


def main():
    """Main function to run the reliability test."""
    print(f"\n{BOLD}Web Service Reliability Tester{RESET}\n")

    # Allow command-line override
    url = sys.argv[1] if len(sys.argv) > 1 else URL
    num_requests = int(sys.argv[2]) if len(sys.argv) > 2 else NUM_REQUESTS

    try:
        tester = ReliabilityTester(
            url=url,
            num_requests=num_requests,
            concurrent_requests=CONCURRENT_REQUESTS,
            timeout=TIMEOUT
        )
        tester.run_tests()
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}Test interrupted by user.{RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n{RED}Error running tests: {e}{RESET}")
        sys.exit(1)


if __name__ == "__main__":
    main()
