from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.zipline import (
    ZiplineCourseModel,
    ZiplineGearModel,
    ZiplineRequest,
    ZiplineResponse,
    calculate_zipline_dynamics,
    get_zipline_course,
    get_zipline_courses,
    get_zipline_gear_checklist,
)

router = APIRouter(prefix="", tags=["zipline"])


@router.get("/api/zipline/courses", response_model=list[ZiplineCourseModel])
@router.get("/zipline/courses", response_model=list[ZiplineCourseModel])
async def get_zipline_courses_endpoint(
    course_type: Optional[str] = None,
) -> list[ZiplineCourseModel]:
    return get_zipline_courses(course_type=course_type)


@router.get("/api/zipline/courses/{course_id}", response_model=ZiplineCourseModel)
@router.get("/zipline/courses/{course_id}", response_model=ZiplineCourseModel)
async def get_zipline_course_endpoint(course_id: str) -> ZiplineCourseModel:
    course = get_zipline_course(course_id)
    if not course:
        raise HTTPException(
            status_code=404,
            detail=f"Zipline course '{course_id}' not found",
        )
    return course


@router.post("/api/zipline/calculate", response_model=ZiplineResponse)
@router.post("/zipline/calculate", response_model=ZiplineResponse)
async def calculate_zipline_endpoint(req: ZiplineRequest) -> ZiplineResponse:
    try:
        return calculate_zipline_dynamics(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/zipline/gear", response_model=list[ZiplineGearModel])
@router.get("/zipline/gear", response_model=list[ZiplineGearModel])
async def get_zipline_gear_endpoint() -> list[ZiplineGearModel]:
    return get_zipline_gear_checklist()
