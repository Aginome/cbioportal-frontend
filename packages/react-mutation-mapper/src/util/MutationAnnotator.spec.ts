import {VariantAnnotation} from "cbioportal-frontend-commons";
import {assert} from "chai";
import sinon from 'sinon';
import * as _ from 'lodash';

import {annotateMutations, resolveMissingProteinPositions} from "./MutationAnnotator";
import {Mutation} from "../model/Mutation";
import {fetchVariantAnnotationsIndexedByGenomicLocation} from "./DataFetcherUtils";

describe("MutationAnnotator", () => {
    const fetchStubResponse = [
        {
            "variant": "X:g.66937331T>A",
            "colocatedVariants": [
            {
                "dbSnpId": "COSM73703"
            }
            ],
            "id": "X:g.66937331T>A",
            "assembly_name": "GRCh37",
            "seq_region_name": "X",
            "start": 66937331,
            "end": 66937331,
            "allele_string": "T/A",
            "strand": 1,
            "most_severe_consequence": "missense_variant",
            "transcript_consequences": [
            {
                "transcript_id": "ENST00000374690",
                "hgvsp": "ENSP00000363822.3:p.Leu729Ile",
                "hgvsc": "ENST00000374690.3:c.2185T>A",
                "variant_allele": "A",
                "codons": "Tta/Ata",
                "protein_id": "ENSP00000363822",
                "protein_start": 729,
                "protein_end": 729,
                "gene_symbol": "AR",
                "gene_id": "ENSG00000169083",
                "amino_acids": "L/I",
                "hgnc_id": 644,
                "canonical": "1",
                "polyphen_score": 0.999,
                "polyphen_prediction": "probably_damaging",
                "sift_score": 0.01,
                "sift_prediction": "deleterious",
                "refseq_transcript_ids": [
                "NM_000044.3"
                ],
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000396043",
                "hgvsp": "ENSP00000379358.2:p.Leu197Ile",
                "hgvsc": "ENST00000396043.2:c.589T>A",
                "variant_allele": "A",
                "codons": "Tta/Ata",
                "protein_id": "ENSP00000379358",
                "protein_start": 197,
                "protein_end": 197,
                "gene_symbol": "AR",
                "gene_id": "ENSG00000169083",
                "amino_acids": "L/I",
                "hgnc_id": 644,
                "polyphen_score": 0.867,
                "polyphen_prediction": "possibly_damaging",
                "sift_score": 0.02,
                "sift_prediction": "deleterious",
                "refseq_transcript_ids": [
                "NM_001011645.2"
                ],
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000396044",
                "hgvsc": "ENST00000396044.3:c.2173+5800T>A",
                "variant_allele": "A",
                "protein_id": "ENSP00000379359",
                "gene_symbol": "AR",
                "gene_id": "ENSG00000169083",
                "hgnc_id": 644,
                "consequence_terms": [
                "intron_variant"
                ]
            }
            ],
            "annotation_summary": {
            "variant": "X:g.66937331T>A",
            "genomicLocation": {
                "chromosome": "X",
                "start": 66937331,
                "end": 66937331,
                "referenceAllele": "T",
                "variantAllele": "A"
            },
            "strandSign": "+",
            "variantType": "SNP",
            "assemblyName": "GRCh37",
            "canonicalTranscriptId": "ENST00000374690",
            "transcriptConsequences": [
                {
                "transcriptId": "ENST00000374690",
                "codonChange": "Tta/Ata",
                "entrezGeneId": "367",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "AR",
                "hgvspShort": "p.L729I",
                "hgvsp": "p.Leu729Ile",
                "hgvsc": "ENST00000374690.3:c.2185T>A",
                "proteinPosition": {
                    "start": 729,
                    "end": 729
                },
                "refSeq": "NM_000044.3",
                "variantClassification": "Missense_Mutation"
                }
            ],
            "transcriptConsequenceSummaries": [
                {
                "transcriptId": "ENST00000374690",
                "codonChange": "Tta/Ata",
                "entrezGeneId": "367",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "AR",
                "hgvspShort": "p.L729I",
                "hgvsp": "p.Leu729Ile",
                "hgvsc": "ENST00000374690.3:c.2185T>A",
                "proteinPosition": {
                    "start": 729,
                    "end": 729
                },
                "refSeq": "NM_000044.3",
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000396043",
                "codonChange": "Tta/Ata",
                "entrezGeneId": "367",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "AR",
                "hgvspShort": "p.L197I",
                "hgvsp": "p.Leu197Ile",
                "hgvsc": "ENST00000396043.2:c.589T>A",
                "proteinPosition": {
                    "start": 197,
                    "end": 197
                },
                "refSeq": "NM_001011645.2",
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000396044",
                "entrezGeneId": "367",
                "consequenceTerms": "intron_variant",
                "hugoGeneSymbol": "AR",
                "hgvspShort": "*725*",
                "hgvsc": "ENST00000396044.3:c.2173+5800T>A",
                "variantClassification": "Intron"
                }
            ],
            "transcriptConsequenceSummary": {
                "transcriptId": "ENST00000374690",
                "codonChange": "Tta/Ata",
                "entrezGeneId": "367",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "AR",
                "hgvspShort": "p.L729I",
                "hgvsp": "p.Leu729Ile",
                "hgvsc": "ENST00000374690.3:c.2185T>A",
                "proteinPosition": {
                "start": 729,
                "end": 729
                },
                "refSeq": "NM_000044.3",
                "variantClassification": "Missense_Mutation"
            }
            }
        },
        {
            "variant": "17:g.41242962_41242963insGA",
            "colocatedVariants": [
            {
                "gnomad_nfe_maf": "9.314E-6",
                "gnomad_nfe_allele": "A",
                "gnomad_afr_maf": "0",
                "gnomad_afr_allele": "A",
                "gnomad_eas_maf": "0",
                "gnomad_eas_allele": "A",
                "dbSnpId": "rs80357742"
            }
            ],
            "id": "17:g.41242962_41242963insGA",
            "assembly_name": "GRCh37",
            "seq_region_name": "17",
            "start": 41242963,
            "end": 41242962,
            "allele_string": "-/GA",
            "strand": 1,
            "most_severe_consequence": "frameshift_variant",
            "transcript_consequences": [
            {
                "transcript_id": "ENST00000309486",
                "hgvsp": "ENSP00000310938.4:p.Gln1099LeufsTer11",
                "hgvsc": "ENST00000309486.4:c.3294_3295dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000310938",
                "protein_start": 1099,
                "protein_end": 1099,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "refseq_transcript_ids": [
                "NM_007297.3"
                ],
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000346315",
                "hgvsp": "ENSP00000246907.4:p.Gln1395LeufsTer11",
                "hgvsc": "ENST00000346315.3:c.4182_4183dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000246907",
                "protein_start": 1395,
                "protein_end": 1395,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000351666",
                "hgvsp": "ENSP00000338007.3:p.Gln212LeufsTer11",
                "hgvsc": "ENST00000351666.3:c.633_634dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000338007",
                "protein_start": 212,
                "protein_end": 212,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000352993",
                "hgvsp": "ENSP00000312236.5:p.Gln253LeufsTer11",
                "hgvsc": "ENST00000352993.3:c.756_757dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000312236",
                "protein_start": 253,
                "protein_end": 253,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000354071",
                "hgvsp": "ENSP00000326002.6:p.Gln1395LeufsTer11",
                "hgvsc": "ENST00000354071.3:c.4182_4183dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000326002",
                "protein_start": 1395,
                "protein_end": 1395,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000357654",
                "hgvsp": "ENSP00000350283.3:p.Gln1395LeufsTer11",
                "hgvsc": "ENST00000357654.3:c.4182_4183dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000350283",
                "protein_start": 1395,
                "protein_end": 1395,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "canonical": "1",
                "refseq_transcript_ids": [
                "NM_007294.3"
                ],
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000412061",
                "variant_allele": "GA",
                "protein_id": "ENSP00000397145",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000461221",
                "hgvsc": "ENST00000461221.1:c.*3965_*3966dup",
                "variant_allele": "GA",
                "protein_id": "ENSP00000418548",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "splice_region_variant",
                "3_prime_UTR_variant",
                "NMD_transcript_variant"
                ]
            },
            {
                "transcript_id": "ENST00000461574",
                "hgvsp": "ENSP00000417241.1:p.Gln160LeufsTer11",
                "hgvsc": "ENST00000461574.1:c.476_477dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000417241",
                "protein_start": 160,
                "protein_end": 160,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000467274",
                "variant_allele": "GA",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000468300",
                "hgvsp": "ENSP00000417148.1:p.Gln292LeufsTer11",
                "hgvsc": "ENST00000468300.1:c.873_874dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000417148",
                "protein_start": 292,
                "protein_end": 292,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "refseq_transcript_ids": [
                "NM_007299.3"
                ],
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000470026",
                "variant_allele": "GA",
                "protein_id": "ENSP00000419274",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000471181",
                "hgvsp": "ENSP00000418960.2:p.Gln1395LeufsTer11",
                "hgvsc": "ENST00000471181.2:c.4182_4183dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000418960",
                "protein_start": 1395,
                "protein_end": 1395,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "refseq_transcript_ids": [
                "NM_007300.3"
                ],
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000473961",
                "variant_allele": "GA",
                "protein_id": "ENSP00000420201",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000476777",
                "variant_allele": "GA",
                "protein_id": "ENSP00000417554",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000477152",
                "variant_allele": "GA",
                "protein_id": "ENSP00000419988",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000478531",
                "hgvsp": "ENSP00000420412.1:p.Gln291LeufsTer11",
                "hgvsc": "ENST00000478531.1:c.870_871dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000420412",
                "protein_start": 291,
                "protein_end": 291,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000484087",
                "hgvsp": "ENSP00000419481.1:p.Gln166LeufsTer11",
                "hgvsc": "ENST00000484087.1:c.495_496dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000419481",
                "protein_start": 166,
                "protein_end": 166,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000487825",
                "hgvsp": "ENSP00000418212.1:p.Gln167LeufsTer11",
                "hgvsc": "ENST00000487825.1:c.498_499dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000418212",
                "protein_start": 167,
                "protein_end": 167,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000491747",
                "hgvsp": "ENSP00000420705.2:p.Gln292LeufsTer11",
                "hgvsc": "ENST00000491747.2:c.873_874dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000420705",
                "protein_start": 292,
                "protein_end": 292,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "refseq_transcript_ids": [
                "NM_007298.3"
                ],
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000492859",
                "variant_allele": "GA",
                "protein_id": "ENSP00000420253",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000493795",
                "hgvsp": "ENSP00000418775.1:p.Gln1348LeufsTer11",
                "hgvsc": "ENST00000493795.1:c.4041_4042dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000418775",
                "protein_start": 1348,
                "protein_end": 1348,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000493919",
                "hgvsp": "ENSP00000418819.1:p.Gln245LeufsTer11",
                "hgvsc": "ENST00000493919.1:c.732_733dup",
                "variant_allele": "GA",
                "codons": "cag/cTCag",
                "protein_id": "ENSP00000418819",
                "protein_start": 245,
                "protein_end": 245,
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "amino_acids": "Q/LX",
                "hgnc_id": 1100,
                "consequence_terms": [
                "frameshift_variant",
                "splice_region_variant"
                ]
            },
            {
                "transcript_id": "ENST00000494123",
                "variant_allele": "GA",
                "protein_id": "ENSP00000419103",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000497488",
                "variant_allele": "GA",
                "protein_id": "ENSP00000418986",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000586385",
                "hgvsc": "ENST00000586385.1:c.5-26996_5-26995dup",
                "variant_allele": "GA",
                "protein_id": "ENSP00000465818",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "intron_variant"
                ]
            },
            {
                "transcript_id": "ENST00000591534",
                "hgvsc": "ENST00000591534.1:c.-43-16426_-43-16425dup",
                "variant_allele": "GA",
                "protein_id": "ENSP00000467329",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "intron_variant"
                ]
            },
            {
                "transcript_id": "ENST00000591849",
                "hgvsc": "ENST00000591849.1:c.-99+34324_-99+34325dup",
                "variant_allele": "GA",
                "protein_id": "ENSP00000465347",
                "gene_symbol": "BRCA1",
                "gene_id": "ENSG00000012048",
                "hgnc_id": 1100,
                "consequence_terms": [
                "intron_variant"
                ]
            }
            ],
            "annotation_summary": {
            "variant": "17:g.41242962_41242963insGA",
            "genomicLocation": {
                "chromosome": "17",
                "start": 41242962,
                "end": 41242963,
                "referenceAllele": "-",
                "variantAllele": "GA"
            },
            "strandSign": "+",
            "variantType": "INS",
            "assemblyName": "GRCh37",
            "canonicalTranscriptId": "ENST00000357654",
            "transcriptConsequences": [
                {
                "transcriptId": "ENST00000357654",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q1395Lfs*11",
                "hgvsp": "p.Gln1395LeufsTer11",
                "hgvsc": "ENST00000357654.3:c.4182_4183dup",
                "proteinPosition": {
                    "start": 1395,
                    "end": 1395
                },
                "refSeq": "NM_007294.3",
                "variantClassification": "Frame_Shift_Ins"
                }
            ],
            "transcriptConsequenceSummaries": [
                {
                "transcriptId": "ENST00000309486",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q1099Lfs*11",
                "hgvsp": "p.Gln1099LeufsTer11",
                "hgvsc": "ENST00000309486.4:c.3294_3295dup",
                "proteinPosition": {
                    "start": 1099,
                    "end": 1099
                },
                "refSeq": "NM_007297.3",
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000346315",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q1395Lfs*11",
                "hgvsp": "p.Gln1395LeufsTer11",
                "hgvsc": "ENST00000346315.3:c.4182_4183dup",
                "proteinPosition": {
                    "start": 1395,
                    "end": 1395
                },
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000351666",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q212Lfs*11",
                "hgvsp": "p.Gln212LeufsTer11",
                "hgvsc": "ENST00000351666.3:c.633_634dup",
                "proteinPosition": {
                    "start": 212,
                    "end": 212
                },
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000352993",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q253Lfs*11",
                "hgvsp": "p.Gln253LeufsTer11",
                "hgvsc": "ENST00000352993.3:c.756_757dup",
                "proteinPosition": {
                    "start": 253,
                    "end": 253
                },
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000354071",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q1395Lfs*11",
                "hgvsp": "p.Gln1395LeufsTer11",
                "hgvsc": "ENST00000354071.3:c.4182_4183dup",
                "proteinPosition": {
                    "start": 1395,
                    "end": 1395
                },
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000357654",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q1395Lfs*11",
                "hgvsp": "p.Gln1395LeufsTer11",
                "hgvsc": "ENST00000357654.3:c.4182_4183dup",
                "proteinPosition": {
                    "start": 1395,
                    "end": 1395
                },
                "refSeq": "NM_007294.3",
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000412061",
                "entrezGeneId": "672",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "BRCA1",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000461221",
                "entrezGeneId": "672",
                "consequenceTerms": "splice_region_variant,3_prime_UTR_variant,NMD_transcript_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.X1322_splice",
                "hgvsc": "ENST00000461221.1:c.*3965_*3966dup",
                "proteinPosition": {
                    "start": 1322,
                    "end": 1322
                },
                "variantClassification": "Splice_Region"
                },
                {
                "transcriptId": "ENST00000461574",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q160Lfs*11",
                "hgvsp": "p.Gln160LeufsTer11",
                "hgvsc": "ENST00000461574.1:c.476_477dup",
                "proteinPosition": {
                    "start": 160,
                    "end": 160
                },
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000467274",
                "entrezGeneId": "672",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "BRCA1",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000468300",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q292Lfs*11",
                "hgvsp": "p.Gln292LeufsTer11",
                "hgvsc": "ENST00000468300.1:c.873_874dup",
                "proteinPosition": {
                    "start": 292,
                    "end": 292
                },
                "refSeq": "NM_007299.3",
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000470026",
                "entrezGeneId": "672",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "BRCA1",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000471181",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q1395Lfs*11",
                "hgvsp": "p.Gln1395LeufsTer11",
                "hgvsc": "ENST00000471181.2:c.4182_4183dup",
                "proteinPosition": {
                    "start": 1395,
                    "end": 1395
                },
                "refSeq": "NM_007300.3",
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000473961",
                "entrezGeneId": "672",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "BRCA1",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000476777",
                "entrezGeneId": "672",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "BRCA1",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000477152",
                "entrezGeneId": "672",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "BRCA1",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000478531",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q291Lfs*11",
                "hgvsp": "p.Gln291LeufsTer11",
                "hgvsc": "ENST00000478531.1:c.870_871dup",
                "proteinPosition": {
                    "start": 291,
                    "end": 291
                },
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000484087",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q166Lfs*11",
                "hgvsp": "p.Gln166LeufsTer11",
                "hgvsc": "ENST00000484087.1:c.495_496dup",
                "proteinPosition": {
                    "start": 166,
                    "end": 166
                },
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000487825",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q167Lfs*11",
                "hgvsp": "p.Gln167LeufsTer11",
                "hgvsc": "ENST00000487825.1:c.498_499dup",
                "proteinPosition": {
                    "start": 167,
                    "end": 167
                },
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000491747",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q292Lfs*11",
                "hgvsp": "p.Gln292LeufsTer11",
                "hgvsc": "ENST00000491747.2:c.873_874dup",
                "proteinPosition": {
                    "start": 292,
                    "end": 292
                },
                "refSeq": "NM_007298.3",
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000492859",
                "entrezGeneId": "672",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "BRCA1",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000493795",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q1348Lfs*11",
                "hgvsp": "p.Gln1348LeufsTer11",
                "hgvsc": "ENST00000493795.1:c.4041_4042dup",
                "proteinPosition": {
                    "start": 1348,
                    "end": 1348
                },
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000493919",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q245Lfs*11",
                "hgvsp": "p.Gln245LeufsTer11",
                "hgvsc": "ENST00000493919.1:c.732_733dup",
                "proteinPosition": {
                    "start": 245,
                    "end": 245
                },
                "variantClassification": "Frame_Shift_Ins"
                },
                {
                "transcriptId": "ENST00000494123",
                "entrezGeneId": "672",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "BRCA1",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000497488",
                "entrezGeneId": "672",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "BRCA1",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000586385",
                "entrezGeneId": "672",
                "consequenceTerms": "intron_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "*2*",
                "hgvsc": "ENST00000586385.1:c.5-26996_5-26995dup",
                "variantClassification": "Intron"
                },
                {
                "transcriptId": "ENST00000591534",
                "entrezGeneId": "672",
                "consequenceTerms": "intron_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "*15*",
                "hgvsc": "ENST00000591534.1:c.-43-16426_-43-16425dup",
                "variantClassification": "Intron"
                },
                {
                "transcriptId": "ENST00000591849",
                "entrezGeneId": "672",
                "consequenceTerms": "intron_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "*33*",
                "hgvsc": "ENST00000591849.1:c.-99+34324_-99+34325dup",
                "variantClassification": "Intron"
                }
            ],
            "transcriptConsequenceSummary": {
                "transcriptId": "ENST00000357654",
                "codonChange": "cag/cTCag",
                "entrezGeneId": "672",
                "consequenceTerms": "frameshift_variant,splice_region_variant",
                "hugoGeneSymbol": "BRCA1",
                "hgvspShort": "p.Q1395Lfs*11",
                "hgvsp": "p.Gln1395LeufsTer11",
                "hgvsc": "ENST00000357654.3:c.4182_4183dup",
                "proteinPosition": {
                "start": 1395,
                "end": 1395
                },
                "refSeq": "NM_007294.3",
                "variantClassification": "Frame_Shift_Ins"
            }
            }
        },
        {
            "variant": "13:g.32912813G>T",
            "colocatedVariants": [
            {
                "dbSnpId": "COSM946800"
            },
            {
                "dbSnpId": "COSM946801"
            }
            ],
            "id": "13:g.32912813G>T",
            "assembly_name": "GRCh37",
            "seq_region_name": "13",
            "start": 32912813,
            "end": 32912813,
            "allele_string": "G/T",
            "strand": 1,
            "most_severe_consequence": "stop_gained",
            "transcript_consequences": [
            {
                "transcript_id": "ENST00000380152",
                "hgvsp": "ENSP00000369497.3:p.Glu1441Ter",
                "hgvsc": "ENST00000380152.3:c.4321G>T",
                "variant_allele": "T",
                "codons": "Gag/Tag",
                "protein_id": "ENSP00000369497",
                "protein_start": 1441,
                "protein_end": 1441,
                "gene_symbol": "BRCA2",
                "gene_id": "ENSG00000139618",
                "amino_acids": "E/*",
                "hgnc_id": 1101,
                "canonical": "1",
                "consequence_terms": [
                "stop_gained"
                ]
            },
            {
                "transcript_id": "ENST00000544455",
                "hgvsp": "ENSP00000439902.1:p.Glu1441Ter",
                "hgvsc": "ENST00000544455.1:c.4321G>T",
                "variant_allele": "T",
                "codons": "Gag/Tag",
                "protein_id": "ENSP00000439902",
                "protein_start": 1441,
                "protein_end": 1441,
                "gene_symbol": "BRCA2",
                "gene_id": "ENSG00000139618",
                "amino_acids": "E/*",
                "hgnc_id": 1101,
                "refseq_transcript_ids": [
                "NM_000059.3"
                ],
                "consequence_terms": [
                "stop_gained"
                ]
            }
            ],
            "annotation_summary": {
            "variant": "13:g.32912813G>T",
            "genomicLocation": {
                "chromosome": "13",
                "start": 32912813,
                "end": 32912813,
                "referenceAllele": "G",
                "variantAllele": "T"
            },
            "strandSign": "+",
            "variantType": "SNP",
            "assemblyName": "GRCh37",
            "canonicalTranscriptId": "ENST00000380152",
            "transcriptConsequences": [
                {
                "transcriptId": "ENST00000380152",
                "codonChange": "Gag/Tag",
                "entrezGeneId": "675",
                "consequenceTerms": "stop_gained",
                "hugoGeneSymbol": "BRCA2",
                "hgvspShort": "p.E1441*",
                "hgvsp": "p.Glu1441Ter",
                "hgvsc": "ENST00000380152.3:c.4321G>T",
                "proteinPosition": {
                    "start": 1441,
                    "end": 1441
                },
                "variantClassification": "Nonsense_Mutation"
                }
            ],
            "transcriptConsequenceSummaries": [
                {
                "transcriptId": "ENST00000380152",
                "codonChange": "Gag/Tag",
                "entrezGeneId": "675",
                "consequenceTerms": "stop_gained",
                "hugoGeneSymbol": "BRCA2",
                "hgvspShort": "p.E1441*",
                "hgvsp": "p.Glu1441Ter",
                "hgvsc": "ENST00000380152.3:c.4321G>T",
                "proteinPosition": {
                    "start": 1441,
                    "end": 1441
                },
                "variantClassification": "Nonsense_Mutation"
                },
                {
                "transcriptId": "ENST00000544455",
                "codonChange": "Gag/Tag",
                "entrezGeneId": "675",
                "consequenceTerms": "stop_gained",
                "hugoGeneSymbol": "BRCA2",
                "hgvspShort": "p.E1441*",
                "hgvsp": "p.Glu1441Ter",
                "hgvsc": "ENST00000544455.1:c.4321G>T",
                "proteinPosition": {
                    "start": 1441,
                    "end": 1441
                },
                "refSeq": "NM_000059.3",
                "variantClassification": "Nonsense_Mutation"
                }
            ],
            "transcriptConsequenceSummary": {
                "transcriptId": "ENST00000380152",
                "codonChange": "Gag/Tag",
                "entrezGeneId": "675",
                "consequenceTerms": "stop_gained",
                "hugoGeneSymbol": "BRCA2",
                "hgvspShort": "p.E1441*",
                "hgvsp": "p.Glu1441Ter",
                "hgvsc": "ENST00000380152.3:c.4321G>T",
                "proteinPosition": {
                "start": 1441,
                "end": 1441
                },
                "variantClassification": "Nonsense_Mutation"
            }
            }
        },
        {
            "variant": "12:g.133214671G>C",
            "colocatedVariants": [
            {
                "dbSnpId": "COSM78324"
            }
            ],
            "id": "12:g.133214671G>C",
            "assembly_name": "GRCh37",
            "seq_region_name": "12",
            "start": 133214671,
            "end": 133214671,
            "allele_string": "G/C",
            "strand": 1,
            "most_severe_consequence": "missense_variant",
            "transcript_consequences": [
            {
                "transcript_id": "ENST00000320574",
                "hgvsp": "ENSP00000322570.5:p.Asn1869Lys",
                "hgvsc": "ENST00000320574.5:c.5607C>G",
                "variant_allele": "C",
                "codons": "aaC/aaG",
                "protein_id": "ENSP00000322570",
                "protein_start": 1869,
                "protein_end": 1869,
                "gene_symbol": "POLE",
                "gene_id": "ENSG00000177084",
                "amino_acids": "N/K",
                "hgnc_id": 9177,
                "canonical": "1",
                "polyphen_score": 0.716,
                "polyphen_prediction": "possibly_damaging",
                "sift_score": 0,
                "sift_prediction": "deleterious",
                "refseq_transcript_ids": [
                "NM_006231.2"
                ],
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000416953",
                "variant_allele": "C",
                "gene_symbol": "POLE",
                "gene_id": "ENSG00000177084",
                "hgnc_id": 9177,
                "consequence_terms": [
                "upstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000434528",
                "hgvsc": "ENST00000434528.3:n.590C>G",
                "variant_allele": "C",
                "gene_symbol": "POLE",
                "gene_id": "ENSG00000177084",
                "hgnc_id": 9177,
                "consequence_terms": [
                "non_coding_transcript_exon_variant"
                ]
            },
            {
                "transcript_id": "ENST00000441786",
                "variant_allele": "C",
                "gene_symbol": "POLE",
                "gene_id": "ENSG00000177084",
                "hgnc_id": 9177,
                "consequence_terms": [
                "upstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000535270",
                "hgvsp": "ENSP00000445753.1:p.Asn1842Lys",
                "hgvsc": "ENST00000535270.1:c.5526C>G",
                "variant_allele": "C",
                "codons": "aaC/aaG",
                "protein_id": "ENSP00000445753",
                "protein_start": 1842,
                "protein_end": 1842,
                "gene_symbol": "POLE",
                "gene_id": "ENSG00000177084",
                "amino_acids": "N/K",
                "hgnc_id": 9177,
                "polyphen_score": 0.408,
                "polyphen_prediction": "benign",
                "sift_score": 0,
                "sift_prediction": "deleterious",
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000537064",
                "hgvsc": "ENST00000537064.1:c.*5358C>G",
                "variant_allele": "C",
                "protein_id": "ENSP00000442578",
                "gene_symbol": "POLE",
                "gene_id": "ENSG00000177084",
                "hgnc_id": 9177,
                "consequence_terms": [
                "3_prime_UTR_variant",
                "NMD_transcript_variant"
                ]
            },
            {
                "transcript_id": "ENST00000541213",
                "hgvsc": "ENST00000541213.1:n.1085C>G",
                "variant_allele": "C",
                "gene_symbol": "POLE",
                "gene_id": "ENSG00000177084",
                "hgnc_id": 9177,
                "consequence_terms": [
                "non_coding_transcript_exon_variant"
                ]
            },
            {
                "transcript_id": "ENST00000542362",
                "variant_allele": "C",
                "gene_symbol": "POLE",
                "gene_id": "ENSG00000177084",
                "hgnc_id": 9177,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000544414",
                "variant_allele": "C",
                "gene_symbol": "POLE",
                "gene_id": "ENSG00000177084",
                "hgnc_id": 9177,
                "consequence_terms": [
                "upstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000544692",
                "variant_allele": "C",
                "gene_symbol": "POLE",
                "gene_id": "ENSG00000177084",
                "hgnc_id": 9177,
                "consequence_terms": [
                "upstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000544870",
                "variant_allele": "C",
                "gene_symbol": "POLE",
                "gene_id": "ENSG00000177084",
                "hgnc_id": 9177,
                "consequence_terms": [
                "upstream_gene_variant"
                ]
            }
            ],
            "annotation_summary": {
            "variant": "12:g.133214671G>C",
            "genomicLocation": {
                "chromosome": "12",
                "start": 133214671,
                "end": 133214671,
                "referenceAllele": "G",
                "variantAllele": "C"
            },
            "strandSign": "+",
            "variantType": "SNP",
            "assemblyName": "GRCh37",
            "canonicalTranscriptId": "ENST00000320574",
            "transcriptConsequences": [
                {
                "transcriptId": "ENST00000320574",
                "codonChange": "aaC/aaG",
                "entrezGeneId": "5426",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "POLE",
                "hgvspShort": "p.N1869K",
                "hgvsp": "p.Asn1869Lys",
                "hgvsc": "ENST00000320574.5:c.5607C>G",
                "proteinPosition": {
                    "start": 1869,
                    "end": 1869
                },
                "refSeq": "NM_006231.2",
                "variantClassification": "Missense_Mutation"
                }
            ],
            "transcriptConsequenceSummaries": [
                {
                "transcriptId": "ENST00000320574",
                "codonChange": "aaC/aaG",
                "entrezGeneId": "5426",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "POLE",
                "hgvspShort": "p.N1869K",
                "hgvsp": "p.Asn1869Lys",
                "hgvsc": "ENST00000320574.5:c.5607C>G",
                "proteinPosition": {
                    "start": 1869,
                    "end": 1869
                },
                "refSeq": "NM_006231.2",
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000416953",
                "entrezGeneId": "5426",
                "consequenceTerms": "upstream_gene_variant",
                "hugoGeneSymbol": "POLE",
                "variantClassification": "5'Flank"
                },
                {
                "transcriptId": "ENST00000434528",
                "entrezGeneId": "5426",
                "consequenceTerms": "non_coding_transcript_exon_variant",
                "hugoGeneSymbol": "POLE",
                "hgvspShort": "*197*",
                "hgvsc": "ENST00000434528.3:n.590C>G",
                "variantClassification": "RNA"
                },
                {
                "transcriptId": "ENST00000441786",
                "entrezGeneId": "5426",
                "consequenceTerms": "upstream_gene_variant",
                "hugoGeneSymbol": "POLE",
                "variantClassification": "5'Flank"
                },
                {
                "transcriptId": "ENST00000535270",
                "codonChange": "aaC/aaG",
                "entrezGeneId": "5426",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "POLE",
                "hgvspShort": "p.N1842K",
                "hgvsp": "p.Asn1842Lys",
                "hgvsc": "ENST00000535270.1:c.5526C>G",
                "proteinPosition": {
                    "start": 1842,
                    "end": 1842
                },
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000537064",
                "entrezGeneId": "5426",
                "consequenceTerms": "3_prime_UTR_variant,NMD_transcript_variant",
                "hugoGeneSymbol": "POLE",
                "hgvspShort": "*1786*",
                "hgvsc": "ENST00000537064.1:c.*5358C>G",
                "variantClassification": "3'UTR"
                },
                {
                "transcriptId": "ENST00000541213",
                "entrezGeneId": "5426",
                "consequenceTerms": "non_coding_transcript_exon_variant",
                "hugoGeneSymbol": "POLE",
                "hgvspShort": "*362*",
                "hgvsc": "ENST00000541213.1:n.1085C>G",
                "variantClassification": "RNA"
                },
                {
                "transcriptId": "ENST00000542362",
                "entrezGeneId": "5426",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "POLE",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000544414",
                "entrezGeneId": "5426",
                "consequenceTerms": "upstream_gene_variant",
                "hugoGeneSymbol": "POLE",
                "variantClassification": "5'Flank"
                },
                {
                "transcriptId": "ENST00000544692",
                "entrezGeneId": "5426",
                "consequenceTerms": "upstream_gene_variant",
                "hugoGeneSymbol": "POLE",
                "variantClassification": "5'Flank"
                },
                {
                "transcriptId": "ENST00000544870",
                "entrezGeneId": "5426",
                "consequenceTerms": "upstream_gene_variant",
                "hugoGeneSymbol": "POLE",
                "variantClassification": "5'Flank"
                }
            ],
            "transcriptConsequenceSummary": {
                "transcriptId": "ENST00000320574",
                "codonChange": "aaC/aaG",
                "entrezGeneId": "5426",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "POLE",
                "hgvspShort": "p.N1869K",
                "hgvsp": "p.Asn1869Lys",
                "hgvsc": "ENST00000320574.5:c.5607C>G",
                "proteinPosition": {
                "start": 1869,
                "end": 1869
                },
                "refSeq": "NM_006231.2",
                "variantClassification": "Missense_Mutation"
            }
            }
        },
        {
            "variant": "17:g.7577539G>A",
            "colocatedVariants": [
            {
                "dbSnpId": "CM010465"
            },
            {
                "dbSnpId": "CM900211"
            },
            {
                "dbSnpId": "COSM10656"
            },
            {
                "dbSnpId": "COSM11564"
            },
            {
                "dbSnpId": "COSM1189381"
            },
            {
                "dbSnpId": "COSM1189382"
            },
            {
                "dbSnpId": "COSM1189383"
            },
            {
                "dbSnpId": "COSM120005"
            },
            {
                "dbSnpId": "COSM120006"
            },
            {
                "dbSnpId": "COSM120007"
            },
            {
                "dbSnpId": "COSM1640831"
            },
            {
                "dbSnpId": "COSM2744594"
            },
            {
                "dbSnpId": "COSM3388183"
            },
            {
                "dbSnpId": "COSM4271789"
            },
            {
                "dbSnpId": "COSM44920"
            },
            {
                "dbSnpId": "COSM45116"
            },
            {
                "dbSnpId": "rs121912651"
            },
            {
                "dbSnpId": "TP53_g.13379C>T"
            }
            ],
            "id": "17:g.7577539G>A",
            "assembly_name": "GRCh37",
            "seq_region_name": "17",
            "start": 7577539,
            "end": 7577539,
            "allele_string": "G/A",
            "strand": 1,
            "most_severe_consequence": "missense_variant",
            "transcript_consequences": [
            {
                "transcript_id": "ENST00000269305",
                "hgvsp": "ENSP00000269305.4:p.Arg248Trp",
                "hgvsc": "ENST00000269305.4:c.742C>T",
                "variant_allele": "A",
                "codons": "Cgg/Tgg",
                "protein_id": "ENSP00000269305",
                "protein_start": 248,
                "protein_end": 248,
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "amino_acids": "R/W",
                "hgnc_id": 11998,
                "canonical": "1",
                "polyphen_score": 1,
                "polyphen_prediction": "probably_damaging",
                "sift_score": 0,
                "sift_prediction": "deleterious",
                "refseq_transcript_ids": [
                "NM_001126112.2",
                "NM_001276761.1",
                "NM_001276760.1",
                "NM_000546.5",
                "NM_001126118.1"
                ],
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000359597",
                "hgvsp": "ENSP00000352610.4:p.Arg248Trp",
                "hgvsc": "ENST00000359597.4:c.742C>T",
                "variant_allele": "A",
                "codons": "Cgg/Tgg",
                "protein_id": "ENSP00000352610",
                "protein_start": 248,
                "protein_end": 248,
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "amino_acids": "R/W",
                "hgnc_id": 11998,
                "polyphen_score": 1,
                "polyphen_prediction": "probably_damaging",
                "sift_score": 0,
                "sift_prediction": "deleterious",
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000413465",
                "hgvsp": "ENSP00000410739.2:p.Arg248Trp",
                "hgvsc": "ENST00000413465.2:c.742C>T",
                "variant_allele": "A",
                "codons": "Cgg/Tgg",
                "protein_id": "ENSP00000410739",
                "protein_start": 248,
                "protein_end": 248,
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "amino_acids": "R/W",
                "hgnc_id": 11998,
                "polyphen_score": 1,
                "polyphen_prediction": "probably_damaging",
                "sift_score": 0,
                "sift_prediction": "deleterious",
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000420246",
                "hgvsp": "ENSP00000391127.2:p.Arg248Trp",
                "hgvsc": "ENST00000420246.2:c.742C>T",
                "variant_allele": "A",
                "codons": "Cgg/Tgg",
                "protein_id": "ENSP00000391127",
                "protein_start": 248,
                "protein_end": 248,
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "amino_acids": "R/W",
                "hgnc_id": 11998,
                "polyphen_score": 1,
                "polyphen_prediction": "probably_damaging",
                "sift_score": 0,
                "sift_prediction": "deleterious",
                "refseq_transcript_ids": [
                "NM_001126114.2",
                "NM_001276696.1"
                ],
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000445888",
                "hgvsp": "ENSP00000391478.2:p.Arg248Trp",
                "hgvsc": "ENST00000445888.2:c.742C>T",
                "variant_allele": "A",
                "codons": "Cgg/Tgg",
                "protein_id": "ENSP00000391478",
                "protein_start": 248,
                "protein_end": 248,
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "amino_acids": "R/W",
                "hgnc_id": 11998,
                "polyphen_score": 1,
                "polyphen_prediction": "probably_damaging",
                "sift_score": 0,
                "sift_prediction": "deleterious",
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000455263",
                "hgvsp": "ENSP00000398846.2:p.Arg248Trp",
                "hgvsc": "ENST00000455263.2:c.742C>T",
                "variant_allele": "A",
                "codons": "Cgg/Tgg",
                "protein_id": "ENSP00000398846",
                "protein_start": 248,
                "protein_end": 248,
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "amino_acids": "R/W",
                "hgnc_id": 11998,
                "polyphen_score": 1,
                "polyphen_prediction": "probably_damaging",
                "sift_score": 0,
                "sift_prediction": "deleterious",
                "refseq_transcript_ids": [
                "NM_001276695.1",
                "NM_001126113.2"
                ],
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000503591",
                "variant_allele": "A",
                "protein_id": "ENSP00000426252",
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "hgnc_id": 11998,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000504290",
                "hgvsc": "ENST00000504290.1:n.624C>T",
                "variant_allele": "A",
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "hgnc_id": 11998,
                "consequence_terms": [
                "non_coding_transcript_exon_variant",
                "non_coding_transcript_variant"
                ]
            },
            {
                "transcript_id": "ENST00000504937",
                "hgvsc": "ENST00000504937.1:n.624C>T",
                "variant_allele": "A",
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "hgnc_id": 11998,
                "consequence_terms": [
                "non_coding_transcript_exon_variant",
                "non_coding_transcript_variant"
                ]
            },
            {
                "transcript_id": "ENST00000505014",
                "variant_allele": "A",
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "hgnc_id": 11998,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000508793",
                "variant_allele": "A",
                "protein_id": "ENSP00000424104",
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "hgnc_id": 11998,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000509690",
                "hgvsp": "ENSP00000425104.1:p.Arg116Trp",
                "hgvsc": "ENST00000509690.1:c.346C>T",
                "variant_allele": "A",
                "codons": "Cgg/Tgg",
                "protein_id": "ENSP00000425104",
                "protein_start": 116,
                "protein_end": 116,
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "amino_acids": "R/W",
                "hgnc_id": 11998,
                "polyphen_score": 1,
                "polyphen_prediction": "probably_damaging",
                "sift_score": 0,
                "sift_prediction": "deleterious",
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000510385",
                "hgvsc": "ENST00000510385.1:n.624C>T",
                "variant_allele": "A",
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "hgnc_id": 11998,
                "consequence_terms": [
                "non_coding_transcript_exon_variant",
                "non_coding_transcript_variant"
                ]
            },
            {
                "transcript_id": "ENST00000514944",
                "hgvsp": "ENSP00000423862.1:p.Arg155Trp",
                "hgvsc": "ENST00000514944.1:c.463C>T",
                "variant_allele": "A",
                "codons": "Cgg/Tgg",
                "protein_id": "ENSP00000423862",
                "protein_start": 155,
                "protein_end": 155,
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "amino_acids": "R/W",
                "hgnc_id": 11998,
                "polyphen_score": 1,
                "polyphen_prediction": "probably_damaging",
                "sift_score": 0,
                "sift_prediction": "deleterious",
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000574684",
                "variant_allele": "A",
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "hgnc_id": 11998,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000576024",
                "variant_allele": "A",
                "protein_id": "ENSP00000458393",
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "hgnc_id": 11998,
                "consequence_terms": [
                "upstream_gene_variant"
                ]
            },
            {
                "transcript_id": "ENST00000604348",
                "variant_allele": "A",
                "protein_id": "ENSP00000473895",
                "gene_symbol": "TP53",
                "gene_id": "ENSG00000141510",
                "hgnc_id": 11998,
                "consequence_terms": [
                "downstream_gene_variant"
                ]
            }
            ],
            "annotation_summary": {
            "variant": "17:g.7577539G>A",
            "genomicLocation": {
                "chromosome": "17",
                "start": 7577539,
                "end": 7577539,
                "referenceAllele": "G",
                "variantAllele": "A"
            },
            "strandSign": "+",
            "variantType": "SNP",
            "assemblyName": "GRCh37",
            "canonicalTranscriptId": "ENST00000269305",
            "transcriptConsequences": [
                {
                "transcriptId": "ENST00000269305",
                "codonChange": "Cgg/Tgg",
                "entrezGeneId": "7157",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "p.R248W",
                "hgvsp": "p.Arg248Trp",
                "hgvsc": "ENST00000269305.4:c.742C>T",
                "proteinPosition": {
                    "start": 248,
                    "end": 248
                },
                "refSeq": "NM_001126112.2",
                "variantClassification": "Missense_Mutation"
                }
            ],
            "transcriptConsequenceSummaries": [
                {
                "transcriptId": "ENST00000269305",
                "codonChange": "Cgg/Tgg",
                "entrezGeneId": "7157",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "p.R248W",
                "hgvsp": "p.Arg248Trp",
                "hgvsc": "ENST00000269305.4:c.742C>T",
                "proteinPosition": {
                    "start": 248,
                    "end": 248
                },
                "refSeq": "NM_001126112.2",
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000359597",
                "codonChange": "Cgg/Tgg",
                "entrezGeneId": "7157",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "p.R248W",
                "hgvsp": "p.Arg248Trp",
                "hgvsc": "ENST00000359597.4:c.742C>T",
                "proteinPosition": {
                    "start": 248,
                    "end": 248
                },
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000413465",
                "codonChange": "Cgg/Tgg",
                "entrezGeneId": "7157",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "p.R248W",
                "hgvsp": "p.Arg248Trp",
                "hgvsc": "ENST00000413465.2:c.742C>T",
                "proteinPosition": {
                    "start": 248,
                    "end": 248
                },
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000420246",
                "codonChange": "Cgg/Tgg",
                "entrezGeneId": "7157",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "p.R248W",
                "hgvsp": "p.Arg248Trp",
                "hgvsc": "ENST00000420246.2:c.742C>T",
                "proteinPosition": {
                    "start": 248,
                    "end": 248
                },
                "refSeq": "NM_001126114.2",
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000445888",
                "codonChange": "Cgg/Tgg",
                "entrezGeneId": "7157",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "p.R248W",
                "hgvsp": "p.Arg248Trp",
                "hgvsc": "ENST00000445888.2:c.742C>T",
                "proteinPosition": {
                    "start": 248,
                    "end": 248
                },
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000455263",
                "codonChange": "Cgg/Tgg",
                "entrezGeneId": "7157",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "p.R248W",
                "hgvsp": "p.Arg248Trp",
                "hgvsc": "ENST00000455263.2:c.742C>T",
                "proteinPosition": {
                    "start": 248,
                    "end": 248
                },
                "refSeq": "NM_001276695.1",
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000503591",
                "entrezGeneId": "7157",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "TP53",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000504290",
                "entrezGeneId": "7157",
                "consequenceTerms": "non_coding_transcript_exon_variant,non_coding_transcript_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "*208*",
                "hgvsc": "ENST00000504290.1:n.624C>T",
                "variantClassification": "RNA"
                },
                {
                "transcriptId": "ENST00000504937",
                "entrezGeneId": "7157",
                "consequenceTerms": "non_coding_transcript_exon_variant,non_coding_transcript_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "*208*",
                "hgvsc": "ENST00000504937.1:n.624C>T",
                "variantClassification": "RNA"
                },
                {
                "transcriptId": "ENST00000505014",
                "entrezGeneId": "7157",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "TP53",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000508793",
                "entrezGeneId": "7157",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "TP53",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000509690",
                "codonChange": "Cgg/Tgg",
                "entrezGeneId": "7157",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "p.R116W",
                "hgvsp": "p.Arg116Trp",
                "hgvsc": "ENST00000509690.1:c.346C>T",
                "proteinPosition": {
                    "start": 116,
                    "end": 116
                },
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000510385",
                "entrezGeneId": "7157",
                "consequenceTerms": "non_coding_transcript_exon_variant,non_coding_transcript_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "*208*",
                "hgvsc": "ENST00000510385.1:n.624C>T",
                "variantClassification": "RNA"
                },
                {
                "transcriptId": "ENST00000514944",
                "codonChange": "Cgg/Tgg",
                "entrezGeneId": "7157",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "p.R155W",
                "hgvsp": "p.Arg155Trp",
                "hgvsc": "ENST00000514944.1:c.463C>T",
                "proteinPosition": {
                    "start": 155,
                    "end": 155
                },
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000574684",
                "entrezGeneId": "7157",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "TP53",
                "variantClassification": "3'Flank"
                },
                {
                "transcriptId": "ENST00000576024",
                "entrezGeneId": "7157",
                "consequenceTerms": "upstream_gene_variant",
                "hugoGeneSymbol": "TP53",
                "variantClassification": "5'Flank"
                },
                {
                "transcriptId": "ENST00000604348",
                "entrezGeneId": "7157",
                "consequenceTerms": "downstream_gene_variant",
                "hugoGeneSymbol": "TP53",
                "variantClassification": "3'Flank"
                }
            ],
            "transcriptConsequenceSummary": {
                "transcriptId": "ENST00000269305",
                "codonChange": "Cgg/Tgg",
                "entrezGeneId": "7157",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "TP53",
                "hgvspShort": "p.R248W",
                "hgvsp": "p.Arg248Trp",
                "hgvsc": "ENST00000269305.4:c.742C>T",
                "proteinPosition": {
                "start": 248,
                "end": 248
                },
                "refSeq": "NM_001126112.2",
                "variantClassification": "Missense_Mutation"
            }
            }
        },
        {
            "variant": "10:g.89692905G>A",
            "colocatedVariants": [
            {
                "dbSnpId": "CM981670"
            },
            {
                "dbSnpId": "CM991081"
            },
            {
                "dbSnpId": "COSM5033"
            },
            {
                "dbSnpId": "COSM5216"
            },
            {
                "dbSnpId": "COSM5277"
            },
            {
                "dbSnpId": "COSM5817"
            },
            {
                "dbSnpId": "rs121909229"
            }
            ],
            "id": "10:g.89692905G>A",
            "assembly_name": "GRCh37",
            "seq_region_name": "10",
            "start": 89692905,
            "end": 89692905,
            "allele_string": "G/A",
            "strand": 1,
            "most_severe_consequence": "missense_variant",
            "transcript_consequences": [
            {
                "transcript_id": "ENST00000371953",
                "hgvsp": "ENSP00000361021.3:p.Arg130Gln",
                "hgvsc": "ENST00000371953.3:c.389G>A",
                "variant_allele": "A",
                "codons": "cGa/cAa",
                "protein_id": "ENSP00000361021",
                "protein_start": 130,
                "protein_end": 130,
                "gene_symbol": "PTEN",
                "gene_id": "ENSG00000171862",
                "amino_acids": "R/Q",
                "hgnc_id": 9588,
                "canonical": "1",
                "polyphen_score": 0.989,
                "polyphen_prediction": "probably_damaging",
                "sift_score": 0.02,
                "sift_prediction": "deleterious",
                "refseq_transcript_ids": [
                "NM_000314.4"
                ],
                "consequence_terms": [
                "missense_variant"
                ]
            },
            {
                "transcript_id": "ENST00000498703",
                "hgvsc": "ENST00000498703.1:n.215G>A",
                "variant_allele": "A",
                "gene_symbol": "PTEN",
                "gene_id": "ENSG00000171862",
                "hgnc_id": 9588,
                "consequence_terms": [
                "non_coding_transcript_exon_variant",
                "non_coding_transcript_variant"
                ]
            }
            ],
            "annotation_summary": {
            "variant": "10:g.89692905G>A",
            "genomicLocation": {
                "chromosome": "10",
                "start": 89692905,
                "end": 89692905,
                "referenceAllele": "G",
                "variantAllele": "A"
            },
            "strandSign": "+",
            "variantType": "SNP",
            "assemblyName": "GRCh37",
            "canonicalTranscriptId": "ENST00000371953",
            "transcriptConsequences": [
                {
                "transcriptId": "ENST00000371953",
                "codonChange": "cGa/cAa",
                "entrezGeneId": "5728",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "PTEN",
                "hgvspShort": "p.R130Q",
                "hgvsp": "p.Arg130Gln",
                "hgvsc": "ENST00000371953.3:c.389G>A",
                "proteinPosition": {
                    "start": 130,
                    "end": 130
                },
                "refSeq": "NM_000314.4",
                "variantClassification": "Missense_Mutation"
                }
            ],
            "transcriptConsequenceSummaries": [
                {
                "transcriptId": "ENST00000371953",
                "codonChange": "cGa/cAa",
                "entrezGeneId": "5728",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "PTEN",
                "hgvspShort": "p.R130Q",
                "hgvsp": "p.Arg130Gln",
                "hgvsc": "ENST00000371953.3:c.389G>A",
                "proteinPosition": {
                    "start": 130,
                    "end": 130
                },
                "refSeq": "NM_000314.4",
                "variantClassification": "Missense_Mutation"
                },
                {
                "transcriptId": "ENST00000498703",
                "entrezGeneId": "5728",
                "consequenceTerms": "non_coding_transcript_exon_variant,non_coding_transcript_variant",
                "hugoGeneSymbol": "PTEN",
                "hgvspShort": "*72*",
                "hgvsc": "ENST00000498703.1:n.215G>A",
                "variantClassification": "RNA"
                }
            ],
            "transcriptConsequenceSummary": {
                "transcriptId": "ENST00000371953",
                "codonChange": "cGa/cAa",
                "entrezGeneId": "5728",
                "consequenceTerms": "missense_variant",
                "hugoGeneSymbol": "PTEN",
                "hgvspShort": "p.R130Q",
                "hgvsp": "p.Arg130Gln",
                "hgvsc": "ENST00000371953.3:c.389G>A",
                "proteinPosition": {
                "start": 130,
                "end": 130
                },
                "refSeq": "NM_000314.4",
                "variantClassification": "Missense_Mutation"
            }
            }
        }
    ];


    let mutationsWithNoGenomicLocation: Partial<Mutation>[];
    let mutationsWithGenomicLocation: Partial<Mutation>[];

    beforeAll(() => {
        mutationsWithNoGenomicLocation =  [
            {
                gene: {
                    hugoGeneSymbol: "AR"
                },
                proteinChange: "L729I",
                mutationType: "",
                variantType: ""
            },
            {
                gene: {
                    hugoGeneSymbol: "AR"
                },
                proteinChange: "K222N",
                mutationType: "",
                variantType: ""
            },
            {
                gene: {
                    hugoGeneSymbol: "BRCA1"
                },
                proteinChange: "Q1395fs",
                mutationType: "",
                variantType: ""
            }
        ];

        mutationsWithGenomicLocation =  [
            {
                chromosome: "X",
                startPosition: 66937331,
                endPosition: 66937331,
                referenceAllele: "T",
                variantAllele: "A"
            },
            {
                chromosome: "17",
                startPosition: 41242962,
                endPosition: 41242963,
                referenceAllele: "-",
                variantAllele: "GA"
            },
            {
                chromosome: "13",
                startPosition: 32912813,
                endPosition: 32912813,
                referenceAllele: "G",
                variantAllele: "T"
            },
            {
                chromosome: "12",
                startPosition: 133214671,
                endPosition: 133214671,
                referenceAllele: "G",
                variantAllele: "C"
            },
            {
                chromosome: "17",
                startPosition: 7577539,
                endPosition: 7577539,
                referenceAllele: "G",
                variantAllele: "A"
            },
            {
                chromosome: "10",
                startPosition: 89692905,
                endPosition: 89692905,
                referenceAllele: "G",
                variantAllele: "A"
            }
        ];
    });

    describe('annotateMutations', () => {

        it("won't annotate mutation data if there are no mutations", (done) => {

            const fetchStub = sinon.stub();
            fetchStub.returns(undefined);

            const genomeNexusClient: any = {
                fetchVariantAnnotationByGenomicLocationPOST: fetchStub
            };

            fetchVariantAnnotationsIndexedByGenomicLocation(
                [],
                ["annotation_summary"],
                "uniprot",
                genomeNexusClient
            ).then((indexedVariantAnnotations: {[genomicLocation: string]: VariantAnnotation}) => {
                const data = annotateMutations([], indexedVariantAnnotations);
                assert.equal(data.length, 0, "annotated mutation data should be empty");
                assert.isFalse(fetchStub.called, "variant annotation fetcher should NOT be called");
                done();
            });
        });

        it("won't annotate mutation data if there are no mutations with genomic coordinate information", (done) => {

            const fetchStub = sinon.stub();
            fetchStub.returns(undefined);

            const genomeNexusClient: any = {
                fetchVariantAnnotationByGenomicLocationPOST: fetchStub
            };

            fetchVariantAnnotationsIndexedByGenomicLocation(
                _.cloneDeep(mutationsWithNoGenomicLocation),
                ["annotation_summary"],
                "uniprot",
                genomeNexusClient
            ).then((indexedVariantAnnotations: {[genomicLocation: string]: VariantAnnotation}) => {
                const data = annotateMutations(_.cloneDeep(mutationsWithNoGenomicLocation), indexedVariantAnnotations);

                assert.deepEqual(data, mutationsWithNoGenomicLocation,
                    "annotated mutation data should be identical to the initial input");
                assert.isFalse(fetchStub.called,
                    "variant annotation fetcher should NOT be called");
                done();
            });
        });

        it("annotates mutation data when the genomic coordinate information is present", (done) => {

            const fetchStub = sinon.stub();
            fetchStub.returns(fetchStubResponse);

            const genomeNexusClient: any = {
                fetchVariantAnnotationByGenomicLocationPOST: fetchStub
            };

            fetchVariantAnnotationsIndexedByGenomicLocation(
                _.cloneDeep(mutationsWithGenomicLocation),
                ["annotation_summary"],
                "uniprot",
                genomeNexusClient
            ).then((indexedVariantAnnotations: {[genomicLocation: string]: VariantAnnotation}) => {
                const data = annotateMutations(mutationsWithGenomicLocation, indexedVariantAnnotations);

                assert.notDeepEqual(data, mutationsWithGenomicLocation,
                    "annotated mutation data should be different than the initial input");
                assert.isTrue(fetchStub.called,
                    "variant annotation fetcher should be called");

                assert.equal(data[0].gene!.hugoGeneSymbol, "AR");
                assert.isTrue(data[0].proteinChange!.includes("L729I"));
                assert.isTrue(data[0].mutationType!.includes("Missense"));

                assert.equal(data[1].gene!.hugoGeneSymbol, "BRCA1");
                assert.isTrue(data[1].proteinChange!.includes("Q1395Lfs*11"));
                assert.isTrue(data[1].mutationType!.includes("Frame_Shift_Ins"));

                assert.equal(data[2].gene!.hugoGeneSymbol, "BRCA2");
                assert.isTrue(data[2].proteinChange!.includes("E1441*"));
                assert.isTrue(data[2].mutationType!.includes("Nonsense"));

                assert.equal(data[3].gene!.hugoGeneSymbol, "POLE");
                assert.isTrue(data[3].proteinChange!.includes("N1869K"));
                assert.isTrue(data[3].mutationType!.includes("Missense"));

                assert.equal(data[4].gene!.hugoGeneSymbol, "TP53");
                assert.isTrue(data[4].proteinChange!.includes("R248W"));
                assert.isTrue(data[4].mutationType!.includes("Missense"));

                assert.equal(data[5].gene!.hugoGeneSymbol, "PTEN");
                assert.isTrue(data[5].proteinChange!.includes("R130Q"));
                assert.isTrue(data[5].mutationType!.includes("Missense"));

                done();
            });
        });
    });

    describe('resolveMissingProteinPositions', () => {

        it("resolves missing protein positions from protein change value", () => {

            const mutations: Partial<Mutation>[] = [
                {
                    proteinChange: "L729I"
                },
                {
                    proteinChange: "K222N"
                },
                {
                    aminoAcidChange: "Q1395fs"
                },
                {
                    proteinChange: "INVALID"
                }
            ];

            resolveMissingProteinPositions(mutations);

            assert.equal(mutations[0].proteinPosStart, 729,
                "proteinChange = L729I => proteinPosStart = 729");
            assert.equal(mutations[1].proteinPosStart, 222,
                "proteinChange = K222N => proteinPosStart = 222");
            assert.equal(mutations[2].proteinPosStart, 1395,
                "aminoAcidChange = Q1395fs => proteinPosStart = 1395");
            assert.isUndefined(mutations[3].proteinPosStart,
                "invalid proteinChange => proteinPosStart = undefined");
        });
    });
});
