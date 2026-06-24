import json

# --- CONFIG ---
# input from exported from postgre elements
INPUT_FILE = "E:\\Download\\periodic_elements.json"
OUTPUT_FILE = "E:\\Download\\periodic_layout.json"
OUTPUT_LIST_FILE = "E:\\Download\\periodic_list.json"

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
    periodic_list = []

    for item in data:
        atomic_number = item.get("atomic_number", 0)

        new_item = {
            "id": item.get("id"),
            "idx": item.get("idx"),
            "idy": item.get("idy"),
            "atomicNumber": atomic_number,
            "atomicGroup": item.get("atomic_group"),
            "atomicName": item.get("atomic_name"),
            "atomicSymbol": item.get("atomic_symbol"),
        }
        item_ = {
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

        output.append(new_item)
        if (item_["atomicNumber"] > 0) & (item_["atomicNumber"] < 200):
            periodic_list.append(item_)

    # --- SORT by atomic_id ---
    output.sort(key=lambda x: x.get("id", 0))
    periodic_list.sort(key=lambda x: x.get("atomicNumber", 0))

    # Save result
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    with open(OUTPUT_LIST_FILE, "w", encoding="utf-8") as f:
        json.dump(periodic_list, f, indent=2, ensure_ascii=False)

    print("Conversion complete! Saved to", OUTPUT_FILE)


if __name__ == "__main__":
    process_json()
