# Unified Business Identifier (UBID) Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hackathon](https://img.shields.io/badge/Hackathon-Karnataka_Commerce_%26_Industry-blue.svg)](#)

A full-stack, AI-powered system designed for the **Karnataka Commerce & Industry Hackathon**. The UBID Platform ingests data from various siloed government departments, uses machine learning to perform entity resolution, and assigns a single source of truth—the Unified Business Identifier (UBID)—to every business.

## 🌟 Key Features

1. **Intelligent Data Pipeline (ETL)**: Automatically ingests and standardizes data (removing common suffixes like "Pvt Ltd", normalizing addresses) from multiple formats.
2. **AI Matching Engine**: Uses `rapidfuzz` and Scikit-Learn to evaluate name, address, and PAN similarities to automatically detect duplicate businesses across departments.
3. **Human-in-the-Loop Review Queue**: A beautifully designed React interface that flags ambiguous matches for human review, providing clear "Explainability" scores (e.g., 92% Name Match).
4. **Activity Engine**: Classifies businesses as Active, Dormant, or Closed based on recent compliance and inspection activity.
5. **Real-time Dashboard**: A premium, animated UI built with Framer Motion and Recharts to monitor system throughput and UBID issuance.
6. **Directory Search API**: Fast, multi-field fuzzy search across all registered businesses using Elasticsearch.

## 🏗️ Architecture & Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts, Lucide Icons
- **API Gateway**: Node.js, Express.js
- **ML & Matching Engine**: FastAPI, Python, Pandas, RapidFuzz
- **Databases**: PostgreSQL (Relational & Queueing), Elasticsearch (Fast Search)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Docker & Docker Compose (for PostgreSQL & Elasticsearch)

### 1. Start the Databases
```bash
docker-compose up -d
```

### 2. Ingest Initial Data
Run the python script to populate the raw database tables.
```bash
python data_pipeline/ingest.py
```

### 3. Start Development Servers
You can easily start all 3 development servers (FastAPI, Node.js API, and React Frontend) on Windows using the provided script:
```powershell
.\run.ps1
```

If running manually:
- **ML Engine**: `cd backend && uvicorn main:app --reload --port 8000`
- **Node API**: `cd node_api && npm start` (Runs on port 3000)
- **Frontend**: `cd frontend && npm run dev` (Runs on port 5173)

### 4. Open the Application
Navigate to `http://localhost:5173` in your browser.

## 🔐 Important Hackathon Requirements Met
- **Explainability**: Reviewers are shown exactly *why* records matched with visual percentage bars.
- **Reversible Decisions**: Actions taken in the review queue are logged in PostgreSQL.
- **Premium UI**: The interface uses modern glassmorphism, fluid animations, and rich dashboards to ensure a highly professional presentation.

## 👥 Contributors
- Shirshak - Full Stack & ML Implementation

---
*Built for the Government of Karnataka.*
