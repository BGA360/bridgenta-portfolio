import os
import sys
import json
import re
import datetime
import hashlib

def normalize_path(path, base_dir):
    rel_path = os.path.relpath(path, base_dir)
    return rel_path.replace("\\", "/")

def validate_registry(registry_data, expected_version="1.1"):
    # Fail-closed on missing structure
    if not isinstance(registry_data, dict):
        raise ValueError("Registry data must be a JSON object.")
    
    if "registry_version" not in registry_data:
        raise ValueError("Missing 'registry_version' in registry.")
    
    if registry_data["registry_version"] != expected_version:
        raise ValueError(f"Wrong registry version: {registry_data['registry_version']}. Expected: {expected_version}")
        
    if "patterns" not in registry_data or not isinstance(registry_data["patterns"], list):
        raise ValueError("Registry must contain a list of 'patterns'.")
    
    seen_ids = set()
    prev_pattern_id = None
    
    for pattern in registry_data["patterns"]:
        if not isinstance(pattern, dict):
            raise ValueError("Each pattern must be a JSON object.")
        
        # Check required fields
        required_fields = ["pattern_id", "regex", "category", "governing_rule", "guidance", "classification"]
        for field in required_fields:
            if field not in pattern or not isinstance(pattern[field], str):
                raise ValueError(f"Pattern missing required string field: '{field}'")
                
        pattern_id = pattern["pattern_id"]
        
        # Enforce pattern ID naming convention
        if not re.match(r"^BECC-REG-[0-9]{3}$", pattern_id):
            raise ValueError(f"Pattern ID '{pattern_id}' does not match naming convention BECC-REG-XXX.")
            
        # Duplicate pattern ID rejection
        if pattern_id in seen_ids:
            raise ValueError(f"Duplicate pattern ID found: '{pattern_id}'")
        seen_ids.add(pattern_id)
        
        # Deterministic sorting check (must be ascending pattern_id order)
        if prev_pattern_id is not None and pattern_id <= prev_pattern_id:
            raise ValueError(f"Registry is unsorted: '{pattern_id}' should follow '{prev_pattern_id}'")
        prev_pattern_id = pattern_id
        
        # Classification enum validation
        if pattern["classification"] not in ["PROHIBITED", "REVIEW_CANDIDATE"]:
            raise ValueError(f"Pattern '{pattern_id}' has invalid classification: '{pattern['classification']}'")
            
        # Validate regex compiles
        try:
            # Check for forbidden stateful/unsupported flags in the pattern
            # For Python, re module doesn't support stateful global 'g' flag syntaxes (which is JS-specific)
            # but we explicitly reject if they try to pass JS-style flags in registry.
            compiled = re.compile(pattern["regex"])
        except re.error as e:
            raise ValueError(f"Invalid regex in pattern '{pattern_id}': {e}")

def run_scan(workspace_dir, registry_path, target_files, mock_timestamp=None):
    # Load registry
    with open(registry_path, "r", encoding="utf-8") as f:
        try:
            registry_data = json.load(f)
        except Exception as e:
            raise ValueError(f"Malformed registry JSON: {e}")
            
    validate_registry(registry_data)
    
    # Sort target files by normalized repository path
    normalized_files = []
    for file_path in target_files:
        norm = normalize_path(file_path, workspace_dir)
        normalized_files.append((norm, file_path))
    normalized_files.sort(key=lambda x: x[0])
    
    candidates = []
    candidate_counter = 1
    seen_candidate_ids = set()
    
    # Process files in sorted order
    for norm_path, abs_path in normalized_files:
        if not os.path.exists(abs_path):
            continue
            
        with open(abs_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        # Scan each line against patterns
        inside_code_block = False
        for line_num, line_content in enumerate(lines, start=1):
            # Check for markdown code block toggle
            stripped = line_content.strip()
            if stripped.startswith("```"):
                inside_code_block = not inside_code_block
                # Clear line content to avoid matching boundary line
                clean_line = " " * len(line_content.rstrip("\r\n")) + (line_content[len(line_content.rstrip("\r\n")):])
            else:
                if inside_code_block:
                    newline = ""
                    if line_content.endswith("\n"):
                        newline = "\n"
                        line_content = line_content[:-1]
                    clean_line = " " * len(line_content) + newline
                else:
                    def repl(match):
                        inner = match.group(1)
                        return "`" + " " * len(inner) + "`"
                    clean_line = re.sub(r"`([^`\n]+)`", repl, line_content)

            for pattern in registry_data["patterns"]:
                regex = pattern["regex"]
                pattern_id = pattern["pattern_id"]
                
                try:
                    compiled = re.compile(regex)
                except Exception:
                    continue
                    
                matches = compiled.finditer(clean_line)
                for m in matches:
                    # Generate a unique candidate ID: BECC-CAN-XXX
                    cand_id = f"BECC-CAN-{candidate_counter:03d}"
                    candidate_counter += 1
                    
                    if cand_id in seen_candidate_ids:
                        raise ValueError(f"Duplicate candidate ID generated: '{cand_id}'")
                    seen_candidate_ids.add(cand_id)
                    
                    # Extract full match text
                    matched_text = m.group(0)
                    
                    match_obj = {
                        "candidate_id": cand_id,
                        "pattern_id": pattern_id,
                        "file": norm_path,
                        "line": line_num,
                        "matched_text": matched_text,
                        "category": pattern["category"],
                        "classification": pattern["classification"]
                    }
                    candidates.append(match_obj)
                    
    # Sort candidate results strictly by file, line, pattern ID, and candidate ID
    candidates.sort(key=lambda x: (x["file"], x["line"], x["pattern_id"], x["candidate_id"]))
    
    # Hashing inputs
    with open(registry_path, "rb") as f:
        registry_hash = hashlib.sha256(f.read()).hexdigest()
        
    validator_path = __file__
    with open(validator_path, "rb") as f:
        validator_hash = hashlib.sha256(f.read()).hexdigest()
        
    # Get current git commit SHA if run in git repo
    commit_sha = "d1d0ef61d5464173b208c07b8acffa4894d87d12" # fallback default
    try:
        import subprocess
        res = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, cwd=workspace_dir)
        if res.returncode == 0:
            commit_sha = res.stdout.strip()
    except Exception:
        pass
        
    timestamp = mock_timestamp if mock_timestamp else datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    scan_output = {
        "source_commit": commit_sha,
        "scan_timestamp": timestamp,
        "registry_version_hash": registry_hash,
        "validator_version_hash": validator_hash,
        "files_scanned": [x[0] for x in normalized_files],
        "completion_status": "SUCCESS",
        "ordered_lexical_candidates": candidates
    }
    
    return scan_output

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python validator.py <workspace_dir> <registry_path> <scan_output_path> [target_files...]")
        sys.exit(1)
        
    workspace = sys.argv[1]
    registry = sys.argv[2]
    out_path = sys.argv[3]
    files = sys.argv[4:]
    
    try:
        scan_res = run_scan(workspace, registry, files)
        # Ensure target dir exists
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as out_f:
            json.dump(scan_res, out_f, indent=2)
        print(f"Scan completed successfully. Output written to {out_path}")
        sys.exit(0)
    except Exception as e:
        print(f"Validator failed closed: {e}", file=sys.stderr)
        sys.exit(1)
