# Conversational GenAI SKU Platform with CRUD & STIBO MDM Integration

---

## 1. Executive Summary  

Pharmacy Benefits Management (PBM) operations depend on accurate SKU data for thousands of products.  
This platform combines GenAI-driven image/OCR onboarding with full CRUD (Create, Read, Update, Delete) capabilities against the existing **STIBO STEP Master Data Management (MDM)** solution.  
A single conversational UI guides users through adding new SKUs, searching/updating existing records, and governing all changes through a **human-in-the-loop** approval workflow.

---

## 2. End-to-End Workflow  

1. **Home / Menu** – User chooses: New SKU, Search/Edit, or Delete  
2. **Upload or Search** – Upload product photo (new) *or* enter SKU/NDC to fetch from STIBO  
3. **Review Details** – AI-extracted or pre-populated fields displayed for confirmation  
4. **Edit Attributes** – User edits or adds attributes; validation runs in real time  
5. **Final Review & Approval** – Changes routed to approvers if policy requires  
6. **Success / Dashboard** – Confirmation, audit-log entry, or escalation for errors  

---

## 3. Single-Window Conversational UI & Stepper Menu  

* A horizontal **stepper** at the top shows the current stage (1–5).  
* A vertical **sidebar** lets users switch functions (New SKU, Search/Edit, Delete) without leaving the screen.  
* The **main panel** hosts the chatbot dialogue, forms, and previews.

---

## 4. System Architecture  

| Layer | Key Components |
|-------|----------------|
| **Frontend SPA** | React / Angular – conversational components, stepper, file/image capture |
| **API Gateway / Orchestrator** | FastAPI / Node.js – manages:<br>• GenAI calls (OpenAI, Azure OpenAI)<br>• OCR services (Tesseract, Google Vision, AWS Rekognition)<br>• STIBO STEP REST API v2 for CRUD ¹<br>• Workflow & approval micro-service |
| **STIBO STEP MDM** | Single source of truth for SKU data; accessed via REST & Data-as-a-Service (DaaS) APIs ² ³ |
| **Message Queue** | Kafka / RabbitMQ – async tasks & review queues |
| **Audit & Monitoring** | ELK / Datadog – every change recorded for compliance |

---

## 5. STIBO STEP Integration Details  

* **STEP REST API v2** exposes standard HTTP verbs (GET, POST, PUT, DELETE) for core objects ¹.  
* **DaaS extension** provides low-latency, read-optimized access ³.

| Operation | Endpoint (example) | Notes |
|-----------|--------------------|-------|
| **Read / Search** | `GET /items?filter=<code\|name>` | Paged results; supports attributes filter |
| **Create** | `POST /items` | JSON payload generated from GenAI extraction |
| **Update** | `PUT /items/{id}` | Executed after reviewer approval |
| **Delete** | `DELETE /items/{id}` | Soft-delete flag; dual approval required |

*Auth*: OAuth 2 / JWT via STEP Connectivity Gallery ⁴.

---

## 6. CRUD & Human-in-the-Loop Workflow  

1. All **create / update / delete** actions publish an event to the `sku.review` topic.  
2. A **reviewer dashboard** consumes the topic, displaying diffs and AI confidence scores.  
3. Reviewers **approve, reject, or request changes**.  
4. Approved events trigger the corresponding STIBO API call and archive an immutable audit record.

---

## 7. Security & Compliance  

* Enterprise **SSO** (OIDC / SAML)  
* **Role-based access**: Creator, Reviewer, Admin  
* Data encrypted **in transit** (TLS 1.3) & **at rest** (AES-256)  
* **FDA & HIPAA**: PHI stripped / tokenized prior to LLM calls  
* **Audit trail** retained **7 years** in WORM storage

---

## 8. Non-Functional Requirements  

| Metric | Target |
|--------|--------|
| **Throughput** | 10 k SKU reads / hr; 500 new SKUs / day |
| **Latency** | \< 2 s read; \< 5 s create/update preview |
| **Availability** | 99.9 % (regional DR, active–passive) |
| **Scalability** | K8s auto-scales on CPU / RPS |

---

## 9. Testing Strategy  

* **Unit & Contract Tests** – mock STIBO API  
* **End-to-End (E2E)** – Cypress (SPA), Postman (API)  
* **AI Validation** – golden datasets for OCR & extraction accuracy  
* **Load Tests** – k6 at 1.5 × peak traffic  
* **User Acceptance** – CRUD with reviewer flow scripts

---

## 10. Deployment & CI/CD  

* **GitHub Actions** – build, test, containerize  
* **Helm charts** – deploy to EKS / AKS  
* **Blue-green** releases with automatic rollback on SLO breach

---

## 11. Roadmap  

| Phase | Timeline | Key Deliverables |
|-------|----------|------------------|
| **Phase 1** | 0–3 mo | MVP: photo upload, GenAI extraction, create SKU + reviewer queue |
| **Phase 2** | 3–6 mo | Search / edit / delete flows, DaaS read optimizations, bulk import |
| **Phase 3** | 6–9 mo | Mobile capture app, multi-image extraction, predictive attribute suggestions |

---

## 12. References  

1. **STEP REST API v2** – supports GET/POST/PUT/DELETE (source: MuleSoft STEP API listing)  
2. **Stibo Systems platform overview** – API-first, multi-domain (Stibo Systems)  
3. **Data-as-a-Service extension** – real-time access (Stibo Systems)  
4. **Connectivity Gallery** – OAuth 2 / JWT integration support (Stibo Systems)

---

### Prepared for: **PBM SKU Automation – June 2025**
