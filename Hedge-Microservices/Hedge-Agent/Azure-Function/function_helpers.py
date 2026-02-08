from Agent.AzurePromptExtraction import AzurePromptExtraction
from Agent.AzureAgent import AzureAgent
from Agent.AzureOpenai import AzureOpenai
import logging
import os
import requests
import json
import random

from typing import Any, Dict, List, Optional

class function_helpers:

  def __init__(self):
    self.GAMMA_BASE_URL = "https://gamma-api.polymarket.com"
  

  def get_prompt(self):
    logging.info("")
    result = AzurePromptExtraction.get_prompt("prompt")
    logging.info(f"Built the prompt")
    return result
  
  def build_prompt(self,prompt:str):
    prompt = prompt.replace(f"%FTSO_data%",self.get_FTSO_live_data())
    ## prompt = prompt.replace(f"%polymarket_data%",polymarket_data)
    return prompt
  
  def get_FTSO_live_data(self) -> str:
    url = f"{os.getenv("FTSO_FEED_BASE_URL")}/ftso_feed_eth"

    r = requests.get(url, timeout=15)
    r.raise_for_status()
    response_body = r.json()

    # IMPORTANT: embed as JSON, not Python dict string
    return json.dumps(response_body)
  
  def _get_tag_id(self,tag_slug: str, session: Optional[requests.Session] = None) -> int:
    """
    Resolve a Polymarket tag slug (e.g., 'ethereum') to its numeric tag id.
    Endpoint: GET https://gamma-api.polymarket.com/tags/slug/{slug}
    """
    s = session or requests.Session()
    url = f"{self.GAMMA_BASE_URL}/tags/slug/{tag_slug}"
    resp = s.get(url, timeout=20)
    resp.raise_for_status()
    data = resp.json()
    if "id" not in data:
        raise ValueError(f"Tag slug '{tag_slug}' did not return an 'id'. Response: {data}")
    return int(data["id"])
  
  def list_open_ethereum_market_slugs_and_titles(self,
    *,
    tag_slug: str = "ethereum",
    page_limit: int = 200,
) -> List[Dict[str, str]]:
    """
    Returns ONLY OPEN Polymarket markets for the Ethereum tag.

    Open == active AND not closed.
    Output format:
        [{"slug": "...", "title": "..."}, ...]
    """
    results: List[Dict[str, str]] = []

    with requests.Session() as session:
        tag_id = self._get_tag_id(tag_slug, session)

        offset = 0
        while True:
            params: Dict[str, Any] = {
                "tag_id": tag_id,
                "active": True,     # market is live
                "closed": False,    # not resolved/ended
                "limit": page_limit,
                "offset": offset,
            }

            resp = session.get(
                f"{self.GAMMA_BASE_URL}/markets",
                params=params,
                timeout=30,
            )
            resp.raise_for_status()
            markets = resp.json()

            if not markets:
                break

            for m in markets:
                slug = m.get("slug")
                title = m.get("question")
                if slug and title:
                    results.append({
                        "slug": slug,
                        "title": title,
                    })

            if len(markets) < page_limit:
                break
            offset += page_limit

    return results 
  
  def query_agent(self) -> list[dict]:
    logging.info("Querying agent")

    # 1️⃣ Run agent
    prompt = self.build_prompt(self.get_prompt())
    agent = AzureAgent("DEFAULT")
    agent.create_message(prompt)

    agent_output_raw = agent.run_agent()

    try:
        agent_output_raw: Dict[str, Any] = json.loads(agent_output_raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Agent output is not valid JSON: {e}") from e

    market = agent_output_raw.get("market") or {}

    agent_output = {
        "message": agent_output_raw.get("message"),
        "mood": agent_output_raw.get("mood"),
        "confidence": agent_output_raw.get("confidence"),

        # accept either schema:
        "yesPrice": agent_output_raw.get("yesPrice", market.get("yesPrice")),

        # optional but useful downstream:
        "slug_found": agent_output_raw.get("slug_found"),
        "successful_slug": market.get("successful_slug"),
        "question": market.get("question"),
    }

    # 2️⃣ Ask GPT-5 for candidate Polymarket slugs
    pairs = self.list_open_ethereum_market_slugs_and_titles()
    random.shuffle(pairs)
    sample = pairs[:5]
    logging.info(sample)
    slug_prompt = f"""
      Give the best slug based on this list of slugs that will yield the best result:
      {sample}

      Based on this output:
      {agent_output_raw}

      Return ONLY a valid JSON array:
      [
        {{ "slug": "<polymarket-market-slug>" }}
      ]

      If no good hedge exists, return [].
      """.strip()
    logging.info(f"Slug prompt: {pairs[:5]}")

    market_list = AzureOpenai.query_gpt_5(slug_prompt)

    logging.info(f"market list: {market_list}")

    if not market_list:
        logging.info("No candidate markets returned")
        market_list = []

    # 3️⃣ POST to Polymark_Validity Azure Function
    payload = {
        "market_list": market_list,
        "agent_output": agent_output
    }
    logging.info(f"Payload: {payload}")

    logging.info("Posting to Polymark_Validity")
    r = requests.post(
        f"{os.getenv("FTSO_FEED_BASE_URL")}/Polymark_Validity",
        json=payload,
        timeout=20
    )
    r.raise_for_status()

    logging.info(f"Final output: {r.json()}")

    # 4️⃣ Return validated response
    return r.json()

