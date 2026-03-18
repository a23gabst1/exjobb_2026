# Examensarbete 2026

Evaluating and comparing the performance of MongoDB and CouchDB configured as clusters of nodes.

## Overview
The main purpose of this experiment was to evaluate and compare the performance of MongoDB and CouchDB configured as a cluster consisting of four storage nodes. The databases were tested with synthetic healthcare data and under various amount of documents (1M, 5M & 10M).

## Necessary Tools
- Node JS
- MongoDB
- CouchDB
- Docker
- Bash (automation & setup)
- mongoimport
- couchimport (npm package)

## Setup

### Prerequisites
- Node JS 
- Docker & Docker Compose 

### 1. Clone the repository
```bash
    git clone https://github.com/a23gabst1/exjobb_2026.git
    cd exjobb_2026
```

### 2. Start the experiment

The **size** parameter controls the size of the dataset

- **9** = 1M documents
- **49** = 5M documents
- **99** = 10M documents

```bash
    chmod +x ./start_experiment.sh
    ./start_experiment <size>
```

### 3. Open the application
Once the script has finished generating data, setting up the clusters and starting the application. Navigate to:  http://localhost:3000

It should look something like this

<img src="./readme_images/web_interface.png.png">

## Author
I'm Gabriel Stedt, and well that's it. 