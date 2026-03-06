# Clara AI Onboarding Automation Pipeline

## Overview

This project implements a **zero-cost automation pipeline** that converts customer call information into a structured **AI voice agent configuration**. The pipeline simulates how **Clara Answers** prepares AI receptionists for service businesses by transforming call data into operational rules and agent prompts.

The workflow processes **demo call data** to generate an initial AI agent configuration (**v1**) and supports **future onboarding updates** that modify the configuration into **v2**, while preserving version history.

This repository demonstrates **systems thinking, automation design, structured data extraction, and reproducible engineering practices**, as required in the Clara Answers Intern Assignment.

---

## Project Goal

The objective of this project is to build an automated workflow that:

1. Extracts structured business information from **demo call transcripts or notes**
2. Generates a **preliminary AI agent configuration (v1)**
3. Stores outputs in a structured, version-controlled format
4. Accepts **onboarding updates** and modifies the agent configuration
5. Produces a **versioned update (v2)** along with a changelog

The system is designed to run **entirely with zero cost tools**, without relying on paid APIs or services.

---

## System Architecture

The automation pipeline follows this workflow:

Demo Call Transcript
↓
Data Extraction Script
↓
Account Memo JSON
↓
Agent Prompt / Configuration Generator
↓
Store Outputs (v1)

When onboarding data is available:

Onboarding Call
↓
Apply Patch Script
↓
Update Account Memo
↓
Generate Agent Spec (v2)
↓
Create Changelog

This structure ensures **repeatability, version control, and transparency** in how agent configurations evolve over time.

---

## Repository Structure

```
clara-ai-onboarding-pipeline

├── README.md
│
├── workflows
│   └── n8n_workflow.json
│
├── scripts
│   ├── extract_account_data.py
│   ├── generate_agent_spec.py
│   └── apply_onboarding_patch.py
│
├── dataset
│   ├── demo_calls
│   │   └── gm_pressure_washing_demo.txt
│   │
│   └── onboarding_calls
│       └── placeholder.txt
│
├── outputs
│   └── accounts
│       └── gm_pressure_washing
│           ├── v1
│           │   ├── memo.json
│           │   └── agent_spec.json
│           │
│           └── v2
│               ├── memo.json
│               └── agent_spec.json
│
└── changelog
    └── gm_pressure_washing_changes.md
```

---

## Dataset

The project currently includes a sample dataset derived from the provided transcript data.

Extracted fields include:

* Company Name: **G&M Pressure Washing**
* Contact Person: **Shelley Manley**
* Phone: **403-870-8494**
* Email: **[gm_pressurewash@yahoo.ca](mailto:gm_pressurewash@yahoo.ca)**
* Business Email: **[info@benselectricsolutionsteam.com](mailto:info@benselectricsolutionsteam.com)**

Any missing information such as **business hours, routing rules, and emergency definitions** is intentionally left blank and added under **questions_or_unknowns**, following the assignment requirement to **avoid inventing missing data**.

---

## Output Files

Each account produces structured outputs stored under:

```
outputs/accounts/<account_id>/
```

### v1 (Demo Call Output)

* `memo.json`
  Structured account configuration derived from demo data.

* `agent_spec.json`
  Retell-style AI agent configuration including prompts and call handling logic.

### v2 (Onboarding Update)

* Updated memo with modifications
* Updated agent specification
* Change tracking for all updates

---

## Scripts

### extract_account_data.py

Reads demo transcript information and converts it into a structured **Account Memo JSON**.

Output:

```
outputs/accounts/<account_id>/v1/memo.json
```

---

### generate_agent_spec.py

Uses the structured account memo to generate an **AI receptionist configuration**, including:

* agent name
* voice style
* system prompt
* call flow rules

Output:

```
outputs/accounts/<account_id>/v1/agent_spec.json
```

---

### apply_onboarding_patch.py

Simulates onboarding updates by modifying the existing account memo and generating **version 2 outputs**.

Output:

```
outputs/accounts/<account_id>/v2/
```

---

## Running the Project

### 1. Clone the repository

```
git clone <repo_url>
cd clara-ai-onboarding-pipeline
```

---

### 2. Generate Account Memo

```
python scripts/extract_account_data.py
```

---

### 3. Generate Agent Configuration

```
python scripts/generate_agent_spec.py
```

---

### 4. Apply Onboarding Update (optional)

```
python scripts/apply_onboarding_patch.py
```

---

## Automation Workflow

A simplified **n8n workflow** is included in the `workflows` folder.

The workflow automates:

1. Transcript ingestion
2. Data extraction
3. Agent configuration generation
4. Output storage

This allows the system to process **multiple accounts in batch** without manual intervention.

---

## Design Principles

This project follows several important engineering principles:

### 1. No Hallucination of Data

If data is missing from the transcript, it is explicitly listed under:

```
questions_or_unknowns
```

This ensures operational safety.

---

### 2. Versioned Agent Configurations

Agent configurations are versioned:

```
v1 → generated from demo call
v2 → updated from onboarding
```

Older versions remain preserved.

---

### 3. Reproducibility

The entire system runs locally using:

* Python
* JSON files
* Optional n8n automation

No external dependencies are required.

---

### 4. Zero Cost Infrastructure

The project uses only **free tools and local execution**, meeting the assignment's zero-spend constraint.

---

## Known Limitations

Current limitations include:

* No automatic audio transcription (demo data provided as text)
* Simplified routing logic
* No live Retell API integration

These limitations were intentional to maintain **zero-cost operation**.

---

## Future Improvements

If production access were available, the following improvements could be added:

* Automatic audio transcription using Whisper
* Automated LLM extraction for richer data
* Web dashboard for account monitoring
* Diff viewer for v1 vs v2 changes
* Direct Retell API integration
* Multi-account batch processing

---

## Conclusion

This project demonstrates a **complete automation pipeline** that converts unstructured call data into structured AI agent configurations. It highlights practical engineering skills including:

* workflow automation
* structured data modeling
* version-controlled configuration management
* safe handling of incomplete information

The system is designed to be **modular, reproducible, and extensible**, closely mirroring real-world onboarding automation workflows used in AI customer service systems.
