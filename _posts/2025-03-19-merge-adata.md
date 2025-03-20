---
title: 'How to deal with OOM when merging adata objects in Scanpy?'
date: 2025-03-19
permalink: /posts/2025/03/merge-adata/
tags:
  - bioinformatics
  - single-cell
---

## Background
I was analyzing a scRNA-seq dataset that requires merging multiple adata objects. Normally, this would involve a simple call of **anndata.concat**. 

```python
import annadata as ad

adata = ad.concat([adata1, adata2])
```
However, as this was a personal project and I had no access to any computing cluster, I frequently ran into silent out of memory (OOM) erros on my local machine, crashing the Jupyter kernel. After some trial and errors and research, I identified three major ways to circumnavigate this problem without the need to downsample the single cell data, which I will summerize in this post. 

## Option 1: Use anndata.experimental.concat_on_disk
Unlike anndata.concat(), this function does not require loading the input adata objects into memory and performs the merging directly to disk. This make the function a memory-efficient alternative for larger datasets, and in my own experience, it also runs very fast!

Note: concat_on_disk do not currently support **scipy.sparse.csc_matrix** in adata objects. If they exisit, it is crucial to convert them in .X and layers to **scipy.sparse.csr_matrix** before running the function. 

```python
import annadata as ad

adata1.X = adata.X.tocsr()
adata1.write_h5ad('adata1_path.h5ad', compression="gzip")

adata2.X = adata.X.tocsr()
adata2.write_h5ad('adata2_path.h5ad', compression="gzip")

adata_paths = ['adata1_path.h5ad', 'adata2_path.h5ad']

ad.experimental.concat_on_disk(in_files=adata_paths, out_file="merged.h5ad")
```

## Option 2: Utilize swap memory
Using swap memory, also known as disk-based virtual memory, can help prevent OOM crashes. However, this can significantly slow down the operations due to physical disk writing. 

```bash
sudo fallocate -l 32G /swapfile  # Allocate 32GB (adjust as needed)
sudo chmod 600 /swapfile         # Secure the file
sudo mkswap /swapfile            # Format as swap space
sudo swapon /swapfile            # Enable swap
```

## Option 3: Use cloud computing services like AWS
This was my least preferred choice as cost can add up pretty quickly. However, AWS services are so versatile and easy to set up that I ended up utilizing for a bit for other more complex tasks like gene regulatory network inference. 

To utilize AWS, we can simply request an EC2 virtual computer instance with enough RAM (e.g., 32GB) and set up the same virtual environment. Files can be transferred between the instance and local machine using the scp command. 

```bash
# upload input files to EC2 instance
scp -i ~/aws_key.pem  adata1.h5ad adata2.h5ad ubuntu@PUBLIC-IP-ADDRESS:~ 

# download merged file to local machine
scp -i ~/aws_key.pem  ubuntu@3.91.89.221:~/merged.h5ad .
```