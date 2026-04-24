Write-Host "Starting UBID Full Stack Project..." -ForegroundColor Green

Write-Host "1. Starting FastAPI ML Engine (Port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; uvicorn main:app --reload --port 8000"

Write-Host "2. Starting Node.js API Gateway (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd node_api; npm start"

Write-Host "3. Starting React Frontend (Port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "All development servers started." -ForegroundColor Green
Write-Host "NOTE: To see actual DB data, ensure 'docker-compose up -d' is running and 'python data_pipeline/ingest.py' is executed." -ForegroundColor Yellow
