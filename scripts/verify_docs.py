import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs"
ROOT_RUNBOOKS = (
    ROOT / "README.md",
    ROOT / "AGENTS.md",
    ROOT / "CONTRIBUTING.md",
)
LINK_PATTERN = re.compile(r"\[.*?\]\((.*?)\)")


def display_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def should_validate_link(link: str) -> bool:
    return not link.startswith(("http://", "https://", "mailto:", "#"))


def normalize_link(link: str) -> str:
    return link.split("#", 1)[0].split("?", 1)[0].strip()


def collect_markdown_files(docs_dir: Path, root_runbooks: tuple[Path, ...]) -> tuple[list[Path], list[str]]:
    errors: list[str] = []
    markdown_files: list[Path] = []

    if not docs_dir.exists():
        return [], [f"Error: {display_path(docs_dir)} directory not found."]

    for entry in sorted(docs_dir.iterdir()):
        if not entry.is_file():
            continue
        if entry.suffix.lower() == ".md":
            markdown_files.append(entry)
        else:
            errors.append(f"Non-markdown file found in docs/: {entry.name}")

    for runbook in root_runbooks:
        if runbook.exists():
            markdown_files.append(runbook)
        else:
            errors.append(f"Missing runbook file: {display_path(runbook)}")

    return markdown_files, errors


def check_markdown_files(docs_dir: Path = DOCS_DIR, root_runbooks: tuple[Path, ...] = ROOT_RUNBOOKS) -> list[str]:
    markdown_files, errors = collect_markdown_files(docs_dir, root_runbooks)

    for source_file in markdown_files:
        content = source_file.read_text(encoding="utf-8")

        for link in LINK_PATTERN.findall(content):
            if not should_validate_link(link):
                continue

            link_path = normalize_link(link)
            if not link_path:
                continue

            target_path = (source_file.parent / link_path).resolve()
            if not target_path.exists():
                errors.append(
                    "Broken link in "
                    f"{display_path(source_file)}: {link} -> {display_path(target_path)}"
                )

    return errors


if __name__ == "__main__":
    validation_errors = check_markdown_files()
    if validation_errors:
        print("Documentation validation failed:")
        for error in validation_errors:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("Documentation validation passed.")
        sys.exit(0)
