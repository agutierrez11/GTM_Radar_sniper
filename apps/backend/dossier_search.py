import os
import re

DOSSIER_DIR = os.path.join(os.path.dirname(__file__), '..', 'dossiers')

def search_dossiers(query):
    """
    Scans the dossiers for tactical snippets related to the query.
    Return a formatted string or None.
    """
    query = query.lower()
    keywords = [k for k in query.split() if len(k) > 3]
    if not keywords:
        return None

    best_match = None
    max_hit_count = 0

    # Priority: exact match > partial matches
    for filename in os.listdir(DOSSIER_DIR):
        if not filename.endswith('.md'):
            continue
        
        path = os.path.join(DOSSIER_DIR, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for hits in this file
                hits = 0
                for kw in keywords:
                    if str(kw) in content.lower():
                        hits += 1
                
                if hits > max_hit_count:
                    max_hit_count = hits
                    sections = re.split(r'\n(?=#+ )', content)
                    for section in sections:
                        s_lower = section.lower()
                        section_hits = sum(1 for kw in keywords if str(kw) in s_lower)
                        if section_hits >= (hits // 2 + 1) or section_hits >= 2:
                            best_match = section.strip()
                            # If it's a very short section, try to include the next one too
                            if len(best_match) < 200 and sections.index(section) + 1 < len(sections):
                                best_match += "\n\n" + sections[sections.index(section)+1].strip()
                            break
        except Exception:
            continue

    if best_match:
        # Clean up some markdown for the bots if needed
        return best_match
    return None

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        test_query = " ".join(sys.argv[1:])
        print(f"SEARCHING: {test_query}")
        result = search_dossiers(test_query)
        if result:
            print("\nMATCH FOUND:\n")
            print(result)
        else:
            print("No significant match found.")
