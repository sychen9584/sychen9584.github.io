---
title: 'Bridging R and Python in Bioinformatics: A Practical Setup with rpy2, uv, and mamba in Jupyter Notebooks'
date: 2025-06-28
permalink: /posts/2025/06/rpy2/
tags:
  - bioinformatics
  - datascience
---

# Introduction
When doing bioinformatics analysis using a Python workstack, it is quite common that crucial software packages are implemented only in R. This language divide often complicates reproducibility and development when trying to integrate R-based methods into Python-centric workflows. Technically, *mamba*, a next-gen reimplementation of *conda* in C++ can manage both Python and R ecosystems in a unified Conda environment. However, *uv* has quickly become the gold standard for managing Python projects thanks to its speed and precision, and it's often good practice to isolate language-specific environments for better reproducibility and fewer conflicts.

In this post, we’ll walk through a clean setup for combining *rpy2*, *uv*, and *mamba* inside a Jupyter Notebook. This lets you run R code from Python seamlessly, leverage both ecosystems in a single workflow, and keep your environments modular and maintainable.

# Step 1: Create a Conda Environment with R via Mamba
```bash
mamba create -n r45_env r-base=4.5 -y
mamba activate r45_env

```

# Step 2: Set Up a uv Python Environment in Your Project Directory and Install Required Packages
```bash
uv venv
source .venv/bin/activate
uv add rpy2 ipykernel
```

# Step 3: Register a Jupyter Kernel for This Hybrid Setup
```bash
uv run ipython kernel install --user --env VIRTUAL_ENV $(pwd)/.venv --name=uv-rpy2
```
Then edit the kernel JSON file (~/.local/share/jupyter/kernels/uv-rpy2/kernel.json) to point to the Conda R:
```json
{
  "argv": [
    "/full/path/to/.venv/bin/python",
    "-m",
    "ipykernel_launcher",
    "-f",
    "{connection_file}"
  ],
  "display_name": "uv-rpy2",
  "language": "python",
  "env": {
    "R_HOME": "/opt/conda/envs/r45_env/lib/R",
    "LD_LIBRARY_PATH": "/opt/conda/envs/r45_env/lib/R/lib"
  }
}
```
Tip: You can find **R_HOME** by running *R RHOME* inside the activated mamba R environment.

# Step 4: Verify It’s Working Inside Jupyter
In a notebook using the new kernel:
```python
import rpy2.robjects as ro
print(ro.r("R.version.string")[0])
```
You should see `'R version 4.5.x (yyyy-mm-dd)'`. 
