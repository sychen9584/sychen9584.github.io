---
title: "Miniranger - a lightweight nextflow pipeline for processing scRNA-seq data 🔧"
excerpt: "A lightweight Nextflow pipeline for processing scRNA-seq data via simpleaf and the alevin-fry ecosystem. Takes FASTQ files and produces a cell × gene expression matrix and QC report."
header:
  teaser: /images/miniranger_flow.png
collection: portfolio
---

<p style='text-align: justify;'> 
nf-core/miniranger is a lightweight bioinformatics pipeline that can be used to analyse single cell RNA sequencing (scRNA-seq) utilizing mainly simpleaf. simpleaf is a rust framework that simplifies the processing of single cell data using tools from the alevin-fry ecosystem. The pipeline takes a samplesheet, FASTQ files, and reference genome FASTA and annotation (gtf) files as input. It performs quality control (QC) and pseudoalignment, and produces a cell x gene expression matrix and QC report as output.
</p>

<center><img src='/images/miniranger_flow.png'> </center> <br/>

<a href="https://github.com/sychen9584/nf-core-miniranger" download class="btn btn-info" style="float: left;">
    🧫 Repository Link
</a>