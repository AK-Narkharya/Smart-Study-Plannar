from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Subject(BaseModel):
    name: str
    chapters: List[str]
    examDate: str  # YYYY-MM-DD

class TimetableRequest(BaseModel):
    subjects: List[Subject]
    studyHoursPerDay: int

@app.post("/generate-timetable")
def generate_timetable(data: TimetableRequest):
    today = datetime.now().date()

    # Filter out subjects with exam dates passed or no chapters
    subjects = [sub for sub in data.subjects if sub.chapters and datetime.strptime(sub.examDate, "%Y-%m-%d").date() > today]

    if not subjects:
        return {"timetable": []}

    # Find the earliest exam date
    earliest_exam_date = min(datetime.strptime(sub.examDate, "%Y-%m-%d").date() for sub in subjects)
    total_days = (earliest_exam_date - today).days

    # Create a day-wise timetable dict: date -> list of (subject, chapter, hours)
    timetable = []
    current_date = today

    # Flatten all chapters with their subjects and exam dates
    chapter_list = []
    for sub in subjects:
        exam_date = datetime.strptime(sub.examDate, "%Y-%m-%d").date()
        days_left = (exam_date - today).days
        for chapter in sub.chapters:
            chapter_list.append({
                "subject": sub.name,
                "chapter": chapter,
                "days_left": days_left
            })

    # Sort chapters by days left ascending (soonest exam first)
    chapter_list.sort(key=lambda x: x["days_left"])

    # Calculate total chapters count
    total_chapters = len(chapter_list)

    # Assign study hours per chapter assuming equal distribution
    # total available hours till earliest exam date = studyHoursPerDay * total_days
    # We will spread chapters evenly across days, prioritizing closer exams

    # Distribute chapters across available days
    day = today
    chapters_assigned = 0
    chapters_per_day = max(1, total_chapters // total_days)  # at least 1 chapter per day

    # For simplicity: assign one chapter per day (can be improved)
    while chapters_assigned < total_chapters and day < earliest_exam_date:
        for _ in range(chapters_per_day):
            if chapters_assigned >= total_chapters:
                break
            chap = chapter_list[chapters_assigned]
            timetable.append({
                "date": day.strftime("%Y-%m-%d"),
                "subject": chap["subject"],
                "chapter": chap["chapter"],
                "hours": round(data.studyHoursPerDay / chapters_per_day, 1)
            })
            chapters_assigned += 1
        day += timedelta(days=1)

    return {"timetable": timetable}
