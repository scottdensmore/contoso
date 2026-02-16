import os
import re
import sys

def check_markdown_files(docs_dir):
    markdown_files = [f for f in os.listdir(docs_dir) if f.endswith('.md')]
    errors = []

    # Check if all files in docs/ are markdown (optional, but good for standardization)
    all_files = os.listdir(docs_dir)
    for f in all_files:
        if not f.endswith('.md'):
            errors.append(f"Non-markdown file found in docs/: {f}")

    for filename in markdown_files:
        filepath = os.path.join(docs_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Simple regex for internal markdown links: [text](./path/to/file.md) or [text](file.md)
        links = re.findall(r'\[.*?\]\((.*?)\)', content)
        for link in links:
            # We only care about relative internal links
            if not link.startswith('http') and not link.startswith('mailto') and not link.startswith('#'):
                # Normalize path
                link_path = link.split('#')[0] # Remove anchors
                if link_path:
                    target_path = os.path.normpath(os.path.join(docs_dir, link_path))
                    if not os.path.exists(target_path):
                        errors.append(f"Broken link in {filename}: {link} -> {target_path}")

    return errors

if __name__ == "__main__":
    docs_directory = "docs"
    if not os.path.exists(docs_directory):
        print(f"Error: {docs_directory} directory not found.")
        sys.exit(1)

    validation_errors = check_markdown_files(docs_directory)
    if validation_errors:
        print("Documentation validation failed:")
        for error in validation_errors:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("Documentation validation passed.")
        sys.exit(0)
