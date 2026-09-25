from typing import Any, Optional

from pydantic import BaseModel, Field


class WildIceVenueModel(BaseModel):
    venue_id: str
    title: str
    water_body: str
    region: str
    surface_elevation_m: int
    ice_type: str
    default_thickness_cm: float
    typical_tour_km: float
    description: str
    highlights: list[str] = Field(default_factory=list)


class WildIceRequest(BaseModel):
    venue_id: str = "lake-malaren-archipelago"
    ice_type: str = "black_ice"
    thickness_cm: float = 8.0
    skater_weight_lbs: float = 180.0
    ambient_temp_f: float = 22.0


class WildIceResponse(BaseModel):
    venue_id: str
    venue_title: str
    effective_thickness_cm: float
    safe_load_capacity_lbs: int
    acoustic_resonance_hz: int
    resonance_description: str
    safety_status: str
    advisory: str


class WildIceGearItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class WildIceIntent(BaseModel):
    action: str
    venue_id: Optional[str] = None
    ice_type: Optional[str] = None


class FormattedWildIceResponse(str):
    _data: dict[str, Any]

    def __new__(cls, answer: str, data: dict[str, Any]):
        instance = super().__new__(cls, answer)
        instance._data = data
        return instance

    def get(self, key: str, default: Any = None) -> Any:
        return self._data.get(key, default)

    def __getitem__(self, key: Any) -> Any:
        if isinstance(key, str) and key in self._data:
            return self._data[key]
        return super().__getitem__(key)

    def __contains__(self, key: object) -> bool:
        if isinstance(key, str):
            return key in self._data or super().__contains__(key)
        return False

    def keys(self):
        return self._data.keys()

    def values(self):
        return self._data.values()

    def items(self):
        return self._data.items()
