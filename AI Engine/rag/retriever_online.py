# rag/retriever_online.py

import requests
import xml.etree.ElementTree as ET
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------------
# PUBMED CONFIG
# -------------------------------
PUBMED_SEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_FETCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
HEADERS = {"User-Agent": "AI-Driven-Personalized-Cancer-Treatment-Planning-System"}


# -------------------------------
# STEP 1: SEARCH PUBMED
# -------------------------------
def pubmed_search(queries, max_results=5):
    """
    Searches PubMed for a list of queries and returns a list of article IDs.

    Args:
        queries (list): A list of search queries.
        max_results (int): The maximum number of results to return for each query.

    Returns:
        list: A list of PubMed article IDs.
    """
    all_pmids = []
    for query in queries:
        params = {
            "db": "pubmed",
            "term": query,
            "retmax": max_results,
            "retmode": "json"
        }

        try:
            r = requests.get(PUBMED_SEARCH, params=params, headers=HEADERS)
            r.raise_for_status()  # Raise an exception for bad status codes
            data = r.json()
            all_pmids.extend(data["esearchresult"]["idlist"])
        except requests.exceptions.RequestException as e:
            logger.error(f"Error searching PubMed for query '{query}': {e}")
    
    return list(set(all_pmids)) # Return unique PMIDs


# -------------------------------
# STEP 2: FETCH ABSTRACTS
# -------------------------------
def pubmed_fetch(pmids):
    """
    Fetches the title and abstract for a list of PubMed article IDs.

    Args:
        pmids (list): A list of PubMed article IDs.

    Returns:
        list: A list of dictionaries, where each dictionary contains the title, abstract, and source of an article.
    """
    if not pmids:
        return []

    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml"
    }

    try:
        r = requests.get(PUBMED_FETCH, params=params, headers=HEADERS)
        r.raise_for_status()  # Raise an exception for bad status codes
        root = ET.fromstring(r.content)
        articles = []

        for article in root.findall(".//PubmedArticle"):
            title = article.findtext(".//ArticleTitle", default="")
            abstract_parts = article.findall(".//AbstractText")
            abstract = " ".join([a.text for a in abstract_parts if a.text])

            if abstract:
                articles.append({
                    "text": f"{title}. {abstract}",
                    "source": "PubMed"
                })

        return articles
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching PubMed articles: {e}")
        return []
    except ET.ParseError as e:
        logger.error(f"Error parsing PubMed XML: {e}")
        return []


# -------------------------------
# MAIN RAG FUNCTION
# -------------------------------
def retrieve_pubmed_evidence(queries, k=5):
    """
    Retrieves evidence from PubMed for a given query.

    Args:
        queries (list): A list of search queries.
        k (int): The number of articles to retrieve for each query.

    Returns:
        list: A list of dictionaries, where each dictionary contains the title, abstract, and source of an article.
    """
    pmids = pubmed_search(queries, k)
    papers = pubmed_fetch(pmids)
    return papers
