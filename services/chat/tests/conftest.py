import sys
from pathlib import Path

# Add the src/api directory to the Python path
api_dir = Path(__file__).parent.parent / "src" / "api"
sys.path.insert(0, str(api_dir))
