import unittest
import os
import tempfile
import json
from tooling.claim_validator.validator import validate_registry, run_scan

class TestValidator(unittest.TestCase):

    def setUp(self):
        self.workspace_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        self.registry_path = os.path.join(self.workspace_dir, "tooling", "claim_validator", "registry", "claim_registry.json")
        self.fixtures_dir = os.path.join(self.workspace_dir, "tooling", "claim_validator", "tests", "fixtures")
        self.valid_fixture = os.path.join(self.fixtures_dir, "valid_project.md")
        self.invalid_fixture = os.path.join(self.fixtures_dir, "invalid_project.md")
        self.expected_results_path = os.path.join(self.fixtures_dir, "expected_results.json")

    def test_valid_registry_compiles(self):
        # 1. Valid registry test
        with open(self.registry_path, "r", encoding="utf-8") as f:
            registry_data = json.load(f)
        try:
            validate_registry(registry_data)
        except Exception as e:
            self.fail(f"Valid registry failed compilation: {e}")

    def test_invalid_registry_schemas(self):
        # 2. Invalid schema (not dict)
        with self.assertRaises(ValueError):
            validate_registry("not a dict")
            
        # Missing fields
        bad_registry = {"patterns": []}
        with self.assertRaises(ValueError):
            validate_registry(bad_registry)

    def test_duplicate_pattern_ids(self):
        # 3. Duplicate pattern IDs
        bad_registry = {
            "registry_version": "1.1",
            "patterns": [
                {
                    "pattern_id": "BECC-REG-001",
                    "regex": "test",
                    "category": "test",
                    "governing_rule": "test rule",
                    "guidance": "test",
                    "classification": "PROHIBITED"
                },
                {
                    "pattern_id": "BECC-REG-001",
                    "regex": "another",
                    "category": "test",
                    "governing_rule": "test rule",
                    "guidance": "test",
                    "classification": "PROHIBITED"
                }
            ]
        }
        with self.assertRaises(ValueError) as ctx:
            validate_registry(bad_registry)
        self.assertIn("Duplicate pattern ID", str(ctx.exception))

    def test_invalid_regex(self):
        # 4. Invalid regex
        bad_registry = {
            "registry_version": "1.1",
            "patterns": [
                {
                    "pattern_id": "BECC-REG-001",
                    "regex": "[invalid regex",
                    "category": "test",
                    "governing_rule": "test rule",
                    "guidance": "test",
                    "classification": "PROHIBITED"
                }
            ]
        }
        with self.assertRaises(ValueError) as ctx:
            validate_registry(bad_registry)
        self.assertIn("Invalid regex", str(ctx.exception))

    def test_wrong_registry_version(self):
        # 6. Wrong registry version
        bad_registry = {
            "registry_version": "2.0",
            "patterns": []
        }
        with self.assertRaises(ValueError) as ctx:
            validate_registry(bad_registry)
        self.assertIn("Wrong registry version", str(ctx.exception))

    def test_missing_governing_rule_reference(self):
        # 7. Missing governing-rule reference
        bad_registry = {
            "registry_version": "1.1",
            "patterns": [
                {
                    "pattern_id": "BECC-REG-001",
                    "regex": "test",
                    "category": "test",
                    "guidance": "test",
                    "classification": "PROHIBITED"
                }
            ]
        }
        with self.assertRaises(ValueError):
            validate_registry(bad_registry)

    def test_unsorted_registry(self):
        # 8. Unsorted registry entries
        bad_registry = {
            "registry_version": "1.1",
            "patterns": [
                {
                    "pattern_id": "BECC-REG-002",
                    "regex": "test",
                    "category": "test",
                    "governing_rule": "test rule",
                    "guidance": "test",
                    "classification": "PROHIBITED"
                },
                {
                    "pattern_id": "BECC-REG-001",
                    "regex": "test",
                    "category": "test",
                    "governing_rule": "test rule",
                    "guidance": "test",
                    "classification": "PROHIBITED"
                }
            ]
        }
        with self.assertRaises(ValueError) as ctx:
            validate_registry(bad_registry)
        self.assertIn("Registry is unsorted", str(ctx.exception))

    def test_fixture_expectations_against_expected_results(self):
        # Load expected results
        with open(self.expected_results_path, "r", encoding="utf-8") as f:
            expected_data = json.load(f)
            
        for case in expected_data["test_cases"]:
            case_id = case["case_id"]
            fixture_rel = case["fixture_source"]
            fixture_abs = os.path.join(self.workspace_dir, fixture_rel)
            
            # Execute scan with a mock timestamp for determinism
            scan_out = run_scan(
                self.workspace_dir,
                self.registry_path,
                [fixture_abs],
                mock_timestamp="2026-07-31T00:00:00Z"
            )
            
            self.assertEqual(scan_out["completion_status"], "SUCCESS")
            
            # Verify match count
            actual_matches = scan_out["ordered_lexical_candidates"]
            self.assertEqual(len(actual_matches), case["expected_match_count"], f"Match count mismatch in case {case_id}")
            
            # Verify matched pattern IDs are in expected pattern IDs
            matched_patterns = {x["pattern_id"] for x in actual_matches}
            for pid in matched_patterns:
                self.assertIn(pid, case["expected_pattern_ids"], f"Unexpected pattern ID {pid} in case {case_id}")
                
            # Verify sorting of output: file, line, pattern_id, candidate_id
            for i in range(len(actual_matches) - 1):
                m1 = actual_matches[i]
                m2 = actual_matches[i+1]
                t1 = (m1["file"], m1["line"], m1["pattern_id"], m1["candidate_id"])
                t2 = (m2["file"], m2["line"], m2["pattern_id"], m2["candidate_id"])
                self.assertLessEqual(t1, t2, f"Output is not sorted deterministically in case {case_id}")

    def test_deterministic_repeated_output(self):
        # 23. Deterministic repeated output & payload equality
        scan1 = run_scan(
            self.workspace_dir,
            self.registry_path,
            [self.valid_fixture, self.invalid_fixture],
            mock_timestamp="2026-07-31T00:00:00Z"
        )
        scan2 = run_scan(
            self.workspace_dir,
            self.registry_path,
            [self.valid_fixture, self.invalid_fixture],
            mock_timestamp="2026-07-31T00:00:00Z"
        )
        
        # Byte-for-byte matching JSON hashes
        payload1 = json.dumps(scan1, sort_keys=True)
        payload2 = json.dumps(scan2, sort_keys=True)
        
        self.assertEqual(payload1, payload2, "Validator output is not deterministic across repeated runs.")

    def test_path_exposure_matches(self):
        # Test path exposure matching logic specifically
        scan_out = run_scan(
            self.workspace_dir,
            self.registry_path,
            [self.invalid_fixture],
            mock_timestamp="2026-07-31T00:00:00Z"
        )
        
        path_leakage_matches = [x for x in scan_out["ordered_lexical_candidates"] if x["pattern_id"] == "BECC-REG-006"]
        self.assertGreater(len(path_leakage_matches), 0, "Failed to match path exposure in invalid fixture.")
        
        # Confirm that valid project paths inside backticks are safe (not matched in valid_project.md)
        scan_valid = run_scan(
            self.workspace_dir,
            self.registry_path,
            [self.valid_fixture],
            mock_timestamp="2026-07-31T00:00:00Z"
        )
        valid_path_matches = [x for x in scan_valid["ordered_lexical_candidates"] if x["pattern_id"] == "BECC-REG-006"]
        self.assertEqual(len(valid_path_matches), 0, "False positive path exposure match in valid fixture.")

if __name__ == "__main__":
    unittest.main()
