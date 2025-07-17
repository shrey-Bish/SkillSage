
import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ROLES = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "DevOps Engineer",
];

function App() {
  const [resumeText, setResumeText] = useState("");
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [targetRole, setTargetRole] = useState(ROLES[0]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [roadmap, setRoadmap] = useState({});
  const [error, setError] = useState("");
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingGap, setLoadingGap] = useState(false);

  // ✅ PDF Upload Handler
  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result);
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        let fullText = "";
  
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n";
        }
  
        setResumeText(fullText);
      } catch (err) {
        console.error("PDF reading failed:", err);
        setError("Failed to read PDF. Ensure the file is not corrupt.");
      }
    };
    fileReader.readAsArrayBuffer(file);
  };
  

  // ✅ Extract Skills API
  const handleExtractSkills = async () => {
    setLoadingExtract(true);
    setError("");
    setExtractedSkills([]);
    setMissingSkills([]);
    setRoadmap({});

    if (!resumeText.trim()) {
      setError("Please paste your resume or upload a PDF.");
      setLoadingExtract(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/extract-skills", {
        text: resumeText,
      });

      if (!res.data.skills || res.data.skills.length === 0) {
        setError("No skills could be extracted from the text.");
      } else {
        setExtractedSkills(res.data.skills);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to extract skills.");
    }

    setLoadingExtract(false);
  };

  // ✅ Skill Gap API
  const handleSkillGap = async () => {
    if (extractedSkills.length === 0) {
      setError("Please extract skills first.");
      return;
    }

    setLoadingGap(true);
    setError("");
    setMissingSkills([]);
    setRoadmap({});

    try {
      const res = await axios.post("http://localhost:8000/api/skill-gap", {
        user_skills: extractedSkills,
        target_role: targetRole,
      });

      setMissingSkills(res.data.missing_skills);
      setRoadmap(res.data.roadmap || {});
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to get skill gap.");
    }

    setLoadingGap(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>SkillSage: Skill Extractor & Gap Generator</h1>

        <label style={styles.label}>Upload your resume (PDF)</label>
        <input type="file" accept=".pdf" onChange={handlePDFUpload} style={{ marginBottom: "16px" }} />

        <label style={styles.label}>Or paste resume or skills text</label>
        <textarea
          style={styles.textarea}
          placeholder="Paste resume or list of skills..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
        <button
          style={loadingExtract ? styles.buttonDisabled : styles.button}
          onClick={handleExtractSkills}
          disabled={loadingExtract}
        >
          {loadingExtract ? "Extracting Skills..." : "Extract Skills"}
        </button>

        {extractedSkills.length > 0 && (
          <>
            <h3>Extracted Skills:</h3>
            <ul>
              {extractedSkills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>

            <label style={styles.label}>Select Target Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              style={styles.select}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <button
              style={loadingGap ? styles.buttonDisabled : styles.button}
              onClick={handleSkillGap}
              disabled={loadingGap}
            >
              {loadingGap ? "Generating Skill Gap..." : "Generate Skill Gap & Roadmap"}
            </button>
          </>
        )}

        {error && <div style={styles.error}>{error}</div>}

        {missingSkills.length > 0 && (
          <div style={styles.resultBox}>
            <h3>Missing Skills:</h3>
            <ul>
              {missingSkills.map((skill) => (
                <li key={skill} style={styles.missingSkill}>
                  {skill}
                </li>
              ))}
            </ul>

            {Object.keys(roadmap).length > 0 && (
              <>
                <h3>Recommended Learning Roadmap:</h3>
                {Object.entries(roadmap).map(([skill, steps]) => (
                  <div key={skill} style={styles.roadmapBlock}>
                    <strong>{skill}</strong>
                    <ol>
                      {steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {missingSkills.length === 0 &&
          extractedSkills.length > 0 &&
          !loadingGap && (
            <div style={styles.success}>🎉 You have all the skills for this role!</div>
          )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "700px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#333",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#555",
  },
  textarea: {
    width: "100%",
    height: "120px",
    padding: "12px",
    fontSize: "1em",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "20px",
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: "10px",
    fontSize: "1em",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "25px",
  },
  button: {
    width: "100%",
    padding: "14px",
    fontSize: "1.1em",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonDisabled: {
    width: "100%",
    padding: "14px",
    fontSize: "1.1em",
    backgroundColor: "#a5b4fc",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "not-allowed",
  },
  error: {
    marginTop: "20px",
    color: "#dc2626",
    textAlign: "center",
    fontWeight: "600",
  },
  resultBox: {
    marginTop: "30px",
    backgroundColor: "#f7f9fc",
    padding: "20px",
    borderRadius: "10px",
  },
  missingSkill: {
    fontSize: "1em",
    marginBottom: "8px",
    color: "#b91c1c",
    fontWeight: "600",
  },
  roadmapBlock: {
    marginTop: "20px",
  },
  success: {
    marginTop: "30px",
    color: "#15803d",
    textAlign: "center",
    fontWeight: "700",
    fontSize: "1.2em",
  },
};

export default App;
