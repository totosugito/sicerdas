import json

# --- CONFIG ---
INPUT_FILE = "E:\\Download\\periodic_elements.json"
OUTPUT_FILE = "E:\\Download\\periodic_layout.json"

# Keep only these fields inside atomic_properties
KEEP_FIELDS = [
    "atomicWeight", "phase", "group", "period", "block", "series", "color",
    "numberOfElectron", "meltingPoint", "boilingPoint", "density",
    "molarVolume", "bulkModulus", "shearModulus", "youngModulus",
    "electronegativity", "electricalConductivity", "resistivity",
    "atomicRadius", "vanDerWaalsRadius"
]

def clean_atomic_properties(raw_string):
    """Parse and keep only selected fields."""
    try:
        props = json.loads(raw_string)
    except:
        return {}

    return {key: props.get(key, "") for key in KEEP_FIELDS}


def process_json():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    output = []

    for item in data:
        atomic_number = item.get("atomic_number", 0)

        new_item = {
            "atomicId": item.get("atomic_id"),
            "idx": item.get("idx"),
            "idy": item.get("idy"),
            "atomicNumber": atomic_number,
            "atomicGroup": item.get("atomic_group"),
            "atomicName": item.get("atomic_name"),
            "atomicSymbol": item.get("atomic_symbol"),
        }

        # Only include atomic_properties if number is between 0 and 200
        if 0 <= atomic_number <= 200:
            new_item["prop"] = clean_atomic_properties(
                item.get("atomic_properties", "{}")
            )
            new_item["prop"]["numberOfElectron"] = atomic_number

        output.append(new_item)

    # --- SORT by atomic_id ---
    output.sort(key=lambda x: x.get("atomicId", 0))

    # Save result
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print("Conversion complete! Saved to", OUTPUT_FILE)


if __name__ == "__main__":
    process_json()
