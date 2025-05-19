import React, { useState } from "react";
import "./App.css";

function App() {
  const [subjects, setSubjects] = useState([]);
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(5);
  const [generatedTimetable, setGeneratedTimetable] = useState([]);

  const addSubject = () => {
    setSubjects([...subjects, { name: "", chapters: [], examDate: "" }]);
  };

  const updateSubject = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const updateChapters = (index, chaptersText) => {
    const newSubjects = [...subjects];
    newSubjects[index].chapters = chaptersText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    setSubjects(newSubjects);
  };

  const deleteSubject = (index) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const generateTimetable = async () => {
    const response = await fetch("http://127.0.0.1:8000/generate-timetable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjects,
        studyHoursPerDay,
      }),
    });

    const data = await response.json();
    if (data.error) {
      alert(data.error);
    } else {
      setGeneratedTimetable(data.timetable);
    }
  };

  return (
    <div className="App">
      <h1>📚 Smart Study Planner</h1>

      <div className="input-section">
        <label>
          Study Hours per Day:
          <input
            type="number"
            value={studyHoursPerDay}
            onChange={(e) => setStudyHoursPerDay(Number(e.target.value))}
          />
        </label>
      </div>

      <button onClick={addSubject}>➕ Add Subject</button>

      {subjects.map((subject, index) => (
        <div key={index} className="subject-section">
          <h3>Subject {index + 1}</h3>
          <input
            type="text"
            placeholder="Subject name"
            value={subject.name}
            onChange={(e) => updateSubject(index, "name", e.target.value)}
          />
          <input
            type="date"
            value={subject.examDate}
            onChange={(e) => updateSubject(index, "examDate", e.target.value)}
          />
          <textarea
            placeholder="Enter chapters (one per line)"
            onChange={(e) => updateChapters(index, e.target.value)}
          ></textarea>
          <button onClick={() => deleteSubject(index)}>❌ Remove</button>
        </div>
      ))}

      <button onClick={generateTimetable}>✅ Generate Timetable</button>

      {generatedTimetable.length > 0 && (
        <div className="timetable">
          <h2>📅 Study Timetable</h2>
          <ul>
            {generatedTimetable.map((entry, idx) => (
              <li key={idx}>
                {entry.date}: {entry.subject} - {entry.chapter} ({entry.hours} hrs)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
