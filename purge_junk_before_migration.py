import os
import glob

def purge_junk():
    # 1. Purge LOGS
    log_files = glob.glob("*.log")
    print(f"Purging {len(log_files)} log files...")
    for f in log_files:
        try:
            os.remove(f)
            print(f"Deleted: {f}")
        except Exception as e:
            print(f"Error deleting {f}: {e}")

    # 2. Purge large CSVs (Audit/Test sets)
    csv_files = ["fullenrich_test_set.csv", "global_vault_audit.csv", "fullenrich_v2_pilot.csv"]
    for f in csv_files:
        if os.path.exists(f):
            try:
                os.remove(f)
                print(f"Deleted: {f}")
            except Exception as e:
                print(f"Error deleting {f}: {e}")

    # 3. Purge tmp directory content (not the dir itself)
    tmp_files = glob.glob("tmp/*")
    print(f"Purging {len(tmp_files)} files in tmp/...")
    for f in tmp_files:
        try:
            os.remove(f)
            print(f"Deleted: {f}")
        except Exception as e:
            print(f"Error deleting {f}: {e}")

if __name__ == "__main__":
    purge_junk()
